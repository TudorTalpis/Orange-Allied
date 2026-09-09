import { config } from "@/lib/config";
import { sleep, uid } from "@/lib/utils";
import { kindLabels } from "@/data/extractionTemplates";
import { pipelineOrder, pipelineStageLabels } from "@/data/mockProcessing";
import type {
  Document,
  DocumentActivityEntry,
  DocumentFileType,
  ProcessingStage,
  ProcessingStageId,
} from "@/types";
import { ApiError, http } from "./client";
import { extractionApi } from "./extraction";
import { fileRegistry } from "./documentStore";
import { mockStore } from "./mockStore";

export interface UploadHandlers {
  onProgress?: (percent: number) => void;
  onStatusChange?: (status: "uploading" | "processing") => void;
  signal?: AbortSignal;
}

function inferType(file: File): DocumentFileType {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  if (file.name.toLowerCase().endsWith(".docx")) return "docx";
  return "image";
}

export function validateFile(file: File): string | null {
  const acceptedTypes = config.acceptedMimeTypes as readonly string[];
  const acceptedExtensions = config.acceptedExtensions as readonly string[];

  const dot = file.name.lastIndexOf(".");
  const extension = dot === -1 ? "" : file.name.slice(dot).toLowerCase();

  if (!extension) {
    return "Fișierul nu are extensie. Încarcă un PDF, JPG, PNG sau DOCX.";
  }
  if (!acceptedExtensions.includes(extension)) {
    return `Fișierele ${extension.replace(".", "").toUpperCase()} nu sunt acceptate. Încarcă un PDF, JPG, PNG sau DOCX.`;
  }

  // Browsers disagree about File.type: some report nothing, some report a
  // generic binary type for a perfectly valid PDF. The extension decides; the
  // reported type only has to not contradict it.
  const unknownTypes = ["", "application/octet-stream", "binary/octet-stream"];
  const reported = file.type.toLowerCase();
  if (!unknownTypes.includes(reported) && !acceptedTypes.includes(reported)) {
    return "Conținutul fișierului nu corespunde extensiei. Încarcă un PDF, JPG, PNG sau DOCX.";
  }

  if (file.size > config.maxUploadBytes) {
    return "Fișierul depășește limita de 50 MB.";
  }
  if (file.size === 0) {
    return "Fișierul pare să fie gol.";
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Pipeline simulation                                                */
/* ------------------------------------------------------------------ */

/** How long each stage takes, in ms. Long enough to read, short enough to demo. */
const STAGE_DURATION: Record<ProcessingStageId, number> = {
  upload: 0,
  ocr: 1100,
  classification: 850,
  extraction: 1200,
  validation: 800,
  embeddings: 1000,
};

const PROCESSING_STAGES = pipelineOrder.filter((stage) => stage !== "upload");

function freshStages(): ProcessingStage[] {
  return pipelineOrder.map((id) => ({
    id,
    label: pipelineStageLabels[id],
    status: id === "upload" ? "completed" : "pending",
  }));
}

function activity(
  action: string,
  actorType: DocumentActivityEntry["actorType"],
  actor: string,
  detail?: string,
): DocumentActivityEntry {
  return {
    id: uid("act"),
    action,
    actor,
    actorType,
    detail,
    timestamp: new Date().toISOString(),
  };
}

function updateDocument(id: string, patch: Partial<Document>): Document | null {
  const index = mockStore.documents.findIndex((doc) => doc.id === id);
  if (index === -1) return null;
  const updated = { ...mockStore.documents[index], ...patch };
  mockStore.documents = [
    ...mockStore.documents.slice(0, index),
    updated,
    ...mockStore.documents.slice(index + 1),
  ];
  mockStore.persist();
  return updated;
}

export interface ProcessHandlers {
  /** Fired whenever the stage list changes, so the queue can re-render. */
  onStages?: (stages: ProcessingStage[]) => void;
  signal?: AbortSignal;
}

export const uploadsApi = {
  /**
   * POST /documents/upload
   *
   * Stores the file and returns the document in `queued` — processing is a
   * separate step, exactly as it will be when a real worker picks the job up.
   */
  async upload(file: File, handlers: UploadHandlers = {}): Promise<Document> {
    const validationError = validateFile(file);
    if (validationError) throw new ApiError(validationError, 422);

    if (!config.useMockApi) {
      const body = new FormData();
      body.append("file", file);
      handlers.onStatusChange?.("uploading");
      const created = await http.post<Document>("/documents/upload", body, {
        signal: handlers.signal,
      });
      handlers.onProgress?.(100);
      return created;
    }

    handlers.onStatusChange?.("uploading");
    for (let percent = 0; percent <= 100; percent += 6 + Math.random() * 10) {
      if (handlers.signal?.aborted) throw new ApiError("Încărcare anulată.", 499);
      handlers.onProgress?.(Math.min(100, Math.round(percent)));
      await sleep(55 + Math.random() * 70);
    }
    handlers.onProgress?.(100);

    const type = inferType(file);
    const id = uid("doc");
    const now = new Date().toISOString();

    const document: Document = {
      id,
      source: "upload",
      name: file.name,
      type,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      status: "queued",
      uploadedAt: now,
      uploadedBy: "Tudor Alpiste",
      pageCount: type === "image" ? 1 : 1 + Math.floor(Math.random() * 4),
      processingStages: freshStages(),
      indexingStatus: "pending",
      metadata: { language: "ro" },
      activity: [activity("Document încărcat", "user", "Tudor Alpiste", file.name)],
    };

    // The real file, so the viewer can show it rather than a placeholder.
    fileRegistry.set(id, file);

    mockStore.documents = [document, ...mockStore.documents];
    mockStore.persist();
    return document;
  },

  /**
   * Walks the document through OCR → classification → extraction → validation →
   * indexing, updating the stored record as each stage completes. The real
   * implementation subscribes to `GET /documents/:id/processing` instead; the
   * callback contract is identical.
   */
  async process(
    documentId: string,
    handlers: ProcessHandlers = {},
  ): Promise<Document> {
    const start = mockStore.documents.find((doc) => doc.id === documentId);
    if (!start) throw new ApiError("Documentul nu a fost găsit.", 404);

    const stages = freshStages();
    const emit = () => handlers.onStages?.(stages.map((stage) => ({ ...stage })));

    updateDocument(documentId, { status: "processing", processingStages: stages });
    emit();

    // A filename can force the failure path — useful for demonstrating retry
    // without waiting on chance.
    const shouldFail = /(fail|corrupt|eroare)/i.test(start.name);
    const extraction = extractionApi.run(start.name, start.pageCount ?? 1);

    for (const stageId of PROCESSING_STAGES) {
      if (handlers.signal?.aborted) throw new ApiError("Procesare anulată.", 499);

      const stage = stages.find((entry) => entry.id === stageId);
      if (!stage) continue;

      stage.status = "active";
      stage.startedAt = new Date().toISOString();
      stage.progress = 0;
      emit();

      const duration = STAGE_DURATION[stageId];
      const ticks = 5;
      for (let tick = 1; tick <= ticks; tick += 1) {
        await sleep(duration / ticks);
        stage.progress = Math.round((tick / ticks) * 100);
        emit();
      }

      if (shouldFail && stageId === "ocr") {
        stage.status = "failed";
        stage.detail = "Stratul de text nu a putut fi citit.";
        stage.progress = undefined;
        emit();

        const failed = updateDocument(documentId, {
          status: "failed",
          processingStages: stages,
          failureReason:
            "Procesare eșuată la etapa OCR: fișierul nu conține un strat de text lizibil.",
          activity: [
            ...(start.activity ?? []),
            activity("OCR eșuat", "system", "Serviciu OCR", "Fișier ilizibil"),
          ],
        });
        throw new ApiError(
          failed?.failureReason ?? "Procesarea a eșuat.",
          500,
        );
      }

      stage.status = "completed";
      stage.finishedAt = new Date().toISOString();
      stage.progress = undefined;
      stage.detail = stageDetail(stageId, extraction);
      emit();
      updateDocument(documentId, { processingStages: stages });
    }

    const finishedAt = new Date().toISOString();
    const needsReview = extraction.fields.some((entry) => entry.needsReview);

    const processed = updateDocument(documentId, {
      status: needsReview ? "needs_review" : "processed",
      processedAt: finishedAt,
      documentType: extraction.documentType,
      categoryId: extraction.categoryId,
      metadata: extraction.metadata,
      extractedText: extraction.extractedText,
      aiSummary: extraction.summary,
      tags: extraction.tags,
      indexingStatus: "indexed",
      processingStages: stages,
      activity: [
        ...(start.activity ?? []),
        activity("OCR finalizat", "system", "Serviciu OCR", `${start.pageCount ?? 1} pagini`),
        activity(
          "Document clasificat",
          "ai",
          "Clasificator",
          `${kindLabels[extraction.documentType]} · încredere ${extraction.classificationConfidence.toFixed(2)}`,
        ),
        activity(
          "Metadate extrase",
          "ai",
          "Model de extragere",
          `${extraction.fields.length} câmpuri`,
        ),
        activity(
          "Index semantic generat",
          "system",
          "Serviciu de indexare",
          "Document disponibil pentru căutare",
        ),
      ],
    });

    if (!processed) throw new ApiError("Documentul nu a fost găsit.", 404);
    return processed;
  },
};

function stageDetail(
  stageId: ProcessingStageId,
  extraction: ReturnType<typeof extractionApi.run>,
): string | undefined {
  switch (stageId) {
    case "classification":
      return kindLabels[extraction.documentType];
    case "extraction":
      return `${extraction.fields.length} câmpuri`;
    case "validation": {
      const flagged = extraction.fields.filter((field) => field.needsReview).length;
      return flagged === 0 ? "Toate câmpurile validate" : `${flagged} de verificat`;
    }
    case "embeddings":
      return "Disponibil pentru căutare";
    default:
      return undefined;
  }
}
