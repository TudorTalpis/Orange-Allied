import type {
  ProcessingEvent,
  ProcessingJob,
  ProcessingStage,
  ProcessingStageId,
  ProcessingStageStatus,
  ProcessingStats,
} from "@/types";

export const pipelineStageLabels: Record<ProcessingStageId, string> = {
  upload: "Încărcare",
  ocr: "OCR",
  classification: "Clasificare",
  extraction: "Extragere metadate",
  validation: "Validare",
  embeddings: "Indexare semantică",
};

export const pipelineStageDescriptions: Record<ProcessingStageId, string> = {
  upload: "Fișierul este stocat și verificat.",
  ocr: "Straturile de text sunt recuperate din PDF-uri, fotografii și scanări.",
  classification: "Tipul documentului este identificat după structură și conținut.",
  extraction: "Sunt extrase câmpurile specifice tipului de document.",
  validation: "Valorile extrase sunt verificate, iar cele cu încredere redusă sunt semnalate.",
  embeddings: "Fragmentele sunt indexate semantic pentru căutare.",
};

export const pipelineOrder: ProcessingStageId[] = [
  "upload",
  "ocr",
  "classification",
  "extraction",
  "validation",
  "embeddings",
];

/**
 * Builds a pipeline where the first `completedCount` stages are done and the
 * next one is either active or failed.
 */
export function buildStages(
  completedCount: number,
  currentStatus: ProcessingStageStatus = "active",
  activeProgress = 45,
): ProcessingStage[] {
  return pipelineOrder.map((id, index) => {
    let status: ProcessingStageStatus = "pending";
    if (index < completedCount) status = "completed";
    else if (index === completedCount) status = currentStatus;

    return {
      id,
      label: pipelineStageLabels[id],
      status,
      progress: status === "active" ? activeProgress : undefined,
      detail: status === "failed" ? "Etapa a returnat o eroare irecuperabilă." : undefined,
    };
  });
}

export const mockProcessingJobs: ProcessingJob[] = [
  {
    id: "job_9001",
    documentId: "doc_scan_lease",
    documentName: "Scan_Office_Lease_Agreement.pdf",
    documentType: "pdf",
    status: "running",
    progress: 58,
    stages: buildStages(3, "active", 62),
    queuedAt: "2026-09-07T07:52:00.000Z",
    startedAt: "2026-09-07T07:52:06.000Z",
    attempts: 1,
  },
  {
    id: "job_9002",
    documentId: "doc_sow_vertex",
    documentName: "SOW_Vertex_Data_Migration.pdf",
    documentType: "pdf",
    status: "queued",
    progress: 0,
    stages: buildStages(0, "pending"),
    queuedAt: "2026-09-07T08:41:03.000Z",
    attempts: 0,
  },
  {
    id: "job_9003",
    documentId: "doc_1051",
    documentName: "Invoice_INV-2026-1051.pdf",
    documentType: "pdf",
    status: "failed",
    progress: 22,
    stages: buildStages(1, "failed"),
    queuedAt: "2026-09-06T16:31:00.000Z",
    startedAt: "2026-09-06T16:31:04.000Z",
    finishedAt: "2026-09-06T16:31:12.000Z",
    durationMs: 8_000,
    error:
      "Etapa OCR a eșuat: fluxul de conținut criptat nu a putut fi decodat (PDF 1.7, AESV3).",
    attempts: 2,
  },
  {
    id: "job_9004",
    documentId: "doc_bank_aug",
    documentName: "Bank_Statement_August_2026.pdf",
    documentType: "pdf",
    status: "running",
    progress: 84,
    stages: buildStages(4, "active", 71),
    queuedAt: "2026-09-07T09:02:00.000Z",
    startedAt: "2026-09-07T09:02:04.000Z",
    attempts: 1,
  },
  {
    id: "job_8990",
    documentId: "doc_employment",
    documentName: "Employment_Contract_A_Mamaliga.pdf",
    documentType: "pdf",
    status: "completed",
    progress: 100,
    stages: buildStages(6),
    queuedAt: "2026-09-01T08:30:00.000Z",
    startedAt: "2026-09-01T08:30:05.000Z",
    finishedAt: "2026-09-01T08:30:51.000Z",
    durationMs: 46_000,
    attempts: 1,
  },
  {
    id: "job_8988",
    documentId: "doc_1049",
    documentName: "Invoice_INV-2026-1049.pdf",
    documentType: "pdf",
    status: "completed",
    progress: 100,
    stages: buildStages(6),
    queuedAt: "2026-09-04T11:22:00.000Z",
    startedAt: "2026-09-04T11:22:03.000Z",
    finishedAt: "2026-09-04T11:22:41.000Z",
    durationMs: 38_000,
    attempts: 1,
  },
  {
    id: "job_8985",
    documentId: "doc_receipt_taxi",
    documentName: "Receipt_Taxi_2026-09-02.png",
    documentType: "image",
    status: "completed",
    progress: 100,
    stages: buildStages(6),
    queuedAt: "2026-09-02T21:16:00.000Z",
    startedAt: "2026-09-02T21:16:02.000Z",
    finishedAt: "2026-09-02T21:16:18.000Z",
    durationMs: 16_000,
    attempts: 1,
  },
  {
    id: "job_8981",
    documentId: "doc_insurance",
    documentName: "Insurance_Policy_Allianz_2026.pdf",
    documentType: "pdf",
    status: "completed",
    progress: 100,
    stages: buildStages(6),
    queuedAt: "2026-08-21T13:48:00.000Z",
    startedAt: "2026-08-21T13:48:03.000Z",
    finishedAt: "2026-08-21T13:49:02.000Z",
    durationMs: 59_000,
    attempts: 1,
  },
  {
    id: "job_8974",
    documentId: "doc_id_card",
    documentName: "ID_Card_Scan.jpg",
    documentType: "image",
    status: "failed",
    progress: 64,
    stages: buildStages(3, "failed"),
    queuedAt: "2026-07-19T15:20:00.000Z",
    startedAt: "2026-07-19T15:20:02.000Z",
    finishedAt: "2026-07-19T15:20:36.000Z",
    durationMs: 34_000,
    error: "Etapa de extragere a generat un câmp sub pragul de verificare.",
    attempts: 1,
  },
];

export const mockProcessingEvents: ProcessingEvent[] = [
  {
    id: "evt_1",
    kind: "metadata_extracted",
    documentId: "doc_bank_aug",
    documentName: "Bank_Statement_August_2026.pdf",
    message: "Au fost extrase 5 câmpuri, inclusiv soldul final și numărul tranzacțiilor.",
    timestamp: "2026-09-07T09:04:12.000Z",
    severity: "success",
  },
  {
    id: "evt_2",
    kind: "ocr_completed",
    documentId: "doc_scan_lease",
    documentName: "Scan_Office_Lease_Agreement.pdf",
    message: "OCR finalizat pentru 31 de pagini scanate în 34 de secunde.",
    timestamp: "2026-09-07T07:52:34.000Z",
    severity: "info",
  },
  {
    id: "evt_3",
    kind: "document_classified",
    documentId: "doc_scan_lease",
    documentName: "Scan_Office_Lease_Agreement.pdf",
    message: "Clasificat ca Contract, cu încredere de 0,91.",
    timestamp: "2026-09-07T07:53:10.000Z",
    severity: "success",
  },
  {
    id: "evt_4",
    kind: "upload_completed",
    documentId: "doc_sow_vertex",
    documentName: "SOW_Vertex_Data_Migration.pdf",
    message: "Încărcarea a fost stocată și pusă pe poziția 2 în coadă.",
    timestamp: "2026-09-07T08:41:03.000Z",
    severity: "info",
  },
  {
    id: "evt_5",
    kind: "processing_failed",
    documentId: "doc_1051",
    documentName: "Invoice_INV-2026-1051.pdf",
    message: "OCR a eșuat: fluxul de conținut criptat nu a putut fi decodat.",
    timestamp: "2026-09-06T16:31:12.000Z",
    severity: "error",
  },
  {
    id: "evt_6",
    kind: "embeddings_generated",
    documentId: "doc_1049",
    documentName: "Invoice_INV-2026-1049.pdf",
    message: "Au fost generate 24 de fragmente și vectori pentru indexare semantică.",
    timestamp: "2026-09-04T11:22:41.000Z",
    severity: "success",
  },
  {
    id: "evt_7",
    kind: "validation_flagged",
    documentId: "doc_insurance",
    documentName: "Insurance_Policy_Allianz_2026.pdf",
    message: "2 câmpuri au coborât sub pragul de încredere de 0,70 și necesită verificare.",
    timestamp: "2026-08-21T13:49:02.000Z",
    severity: "warning",
  },
  {
    id: "evt_8",
    kind: "metadata_extracted",
    documentId: "doc_receipt_taxi",
    documentName: "Receipt_Taxi_2026-09-02.png",
    message: "Au fost extrase comerciantul, data și totalul dintr-o captură de telefon.",
    timestamp: "2026-09-02T21:16:18.000Z",
    severity: "success",
  },
];

export const mockProcessingStats: ProcessingStats = {
  activeJobs: 2,
  queuedJobs: 1,
  completedToday: 47,
  failedToday: 2,
  averageDurationMs: 41_000,
  successRate: 0.96,
};
