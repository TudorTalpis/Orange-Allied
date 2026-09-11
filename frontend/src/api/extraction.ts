import { config } from "@/lib/config";
import {
  classifyByFileName,
  extractFor,
  kindToCategory,
  seedFrom,
} from "@/data/extractionTemplates";
import type { Document, DocumentKind, ExtractedField } from "@/types";
import { http } from "./client";
import { mockLatency } from "./mockDelay";

/**
 * The extraction service.
 *
 * In production this is the backend's classification + extraction result,
 * fetched with `GET /documents/:id/extraction`. Here the same shape is produced
 * locally from the filename, so the UI is written against the final contract.
 */
export interface ExtractionOutcome {
  documentType: DocumentKind;
  categoryId?: string;
  classificationConfidence: number;
  fields: ExtractedField[];
  extractedText: string;
  summary: string;
  tags: string[];
  metadata: Document["metadata"];
}

export const extractionApi = {
  /** GET /documents/:id/extraction */
  async get(documentId: string): Promise<ExtractionOutcome> {
    if (!config.useMockApi) {
      return http.get<ExtractionOutcome>(`/documents/${documentId}/extraction`);
    }
    await mockLatency();
    throw new Error("Extragerea este disponibilă doar în momentul procesării.");
  },

  /**
   * Runs classification and extraction for a file. Pure and synchronous: the
   * pipeline decides when to call it, so the timing lives in one place.
   */
  run(fileName: string, pageCount: number): ExtractionOutcome {
    const documentType = classifyByFileName(fileName);
    const result = extractFor(documentType, fileName, pageCount);
    const rand = seedFrom(`${fileName}:confidence`);

    return {
      documentType,
      categoryId: kindToCategory[documentType],
      // An unmatched filename is genuinely a low-confidence classification.
      classificationConfidence:
        documentType === "other" ? 0.42 + rand() * 0.12 : 0.9 + rand() * 0.09,
      fields: result.fields,
      extractedText: result.extractedText,
      summary: result.summary,
      tags: result.tags,
      metadata: {
        ...result.normalised,
        language: "ro",
        pageCount,
        fields: result.fields,
      },
    };
  },
};
