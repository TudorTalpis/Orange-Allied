/** The fixed pipeline every uploaded document travels through. */
export type ProcessingStageId =
  | "upload"
  | "ocr"
  | "classification"
  | "extraction"
  | "validation"
  | "embeddings";

export type ProcessingStageStatus =
  | "pending"
  | "active"
  | "completed"
  | "failed"
  | "skipped";

export interface ProcessingStage {
  id: ProcessingStageId;
  label: string;
  status: ProcessingStageStatus;
  startedAt?: string;
  finishedAt?: string;
  /** 0–100, only meaningful while `status === "active"`. */
  progress?: number;
  detail?: string;
}

export type ProcessingJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface ProcessingJob {
  id: string;
  documentId: string;
  documentName: string;
  documentType: "pdf" | "image";
  status: ProcessingJobStatus;
  progress: number;
  stages: ProcessingStage[];
  queuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  error?: string;
  attempts: number;
}

export type ProcessingEventKind =
  | "ocr_completed"
  | "document_classified"
  | "metadata_extracted"
  | "embeddings_generated"
  | "validation_flagged"
  | "processing_failed"
  | "upload_completed";

export interface ProcessingEvent {
  id: string;
  kind: ProcessingEventKind;
  documentId: string;
  documentName: string;
  message: string;
  timestamp: string;
  severity: "info" | "success" | "warning" | "error";
}

export interface ProcessingStats {
  activeJobs: number;
  queuedJobs: number;
  completedToday: number;
  failedToday: number;
  averageDurationMs: number;
  successRate: number;
}
