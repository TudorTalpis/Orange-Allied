export type DocumentFileType = "pdf" | "image" | "docx";

export type DocumentStatus =
  | "queued"
  | "processing"
  | "processed"
  | "failed"
  | "needs_review";

/**
 * Semantic document classes produced by the classification stage. The union is
 * intentionally open-ended (`string & {}`) so a backend can introduce new
 * classes without a frontend release.
 */
export type DocumentKind =
  | "invoice"
  | "contract"
  | "receipt"
  | "tax_document"
  | "insurance_policy"
  | "employment_contract"
  | "bank_statement"
  | "identity_document"
  | "report"
  | "other";

/**
 * A single field extracted by the AI pipeline. Keeping extraction generic —
 * rather than hard-coding invoice columns — lets every document class expose
 * its own field set while sharing one rendering component.
 */
export type ExtractedFieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "boolean"
  | "list";

export interface ExtractedField {
  key: string;
  /** Human label as it should appear in the UI. */
  label: string;
  value: string | number | boolean | string[] | null;
  type: ExtractedFieldType;
  /** Model confidence between 0 and 1. */
  confidence: number;
  /** Page the value was located on, when the pipeline can attribute it. */
  page?: number;
  /** Set when validation flagged the value for a human. */
  needsReview?: boolean;
  currency?: string;
}

/**
 * Well-known metadata. Every property is optional: a receipt has no due date,
 * a contract has no invoice number. Class-specific values that do not fit here
 * live in `fields`, which is the canonical, generic representation.
 */
export interface DocumentMetadata {
  invoiceNumber?: string;
  company?: string;
  customer?: string;
  date?: string;
  dueDate?: string;
  subtotal?: number;
  tax?: number;
  amount?: number;
  currency?: string;
  address?: string;
  language?: string;
  pageCount?: number;
  /** The generic, class-agnostic field list rendered by MetadataPanel. */
  fields?: ExtractedField[];
}

export interface DocumentActivityEntry {
  id: string;
  action: string;
  detail?: string;
  actor: string;
  actorType: "user" | "system" | "ai";
  timestamp: string;
}

export interface Document {
  id: string;
  /**
   * Where the record came from. Seeded documents ship with the prototype;
   * uploaded ones are the user's own and are the only records persisted
   * locally, so the demo survives a refresh without duplicating the fixtures.
   */
  source?: "seed" | "upload";
  name: string;
  type: DocumentFileType;
  mimeType: string;
  size: number;
  categoryId?: string;
  documentType?: DocumentKind;
  status: DocumentStatus;
  uploadedAt: string;
  processedAt?: string;
  uploadedBy: string;
  pageCount?: number;
  /** Thumbnail/preview URL served by the backend; mocked as undefined. */
  previewUrl?: string;
  tags?: string[];
  metadata?: DocumentMetadata;
  /** Text recognised during OCR. The backend can omit this until OCR finishes. */
  extractedText?: string;
  /** The persisted processing result, used by the details page and job monitor. */
  processingStages?: import("./processing").ProcessingStage[];
  /** Whether the document can be found through keyword and semantic search. */
  indexingStatus?: "pending" | "indexed" | "failed";
  aiSummary?: string;
  /** Populated when status === "failed". */
  failureReason?: string;
  activity?: DocumentActivityEntry[];
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  /** Lucide icon name, resolved through the icon registry. */
  icon: string;
  color: string;
  documentCount: number;
  updatedAt: string;
  system?: boolean;
}

export interface DocumentFilters {
  query?: string;
  type?: DocumentFileType | "all";
  documentType?: DocumentKind | "all";
  categoryId?: string | "all";
  status?: DocumentStatus | "all";
  company?: string | "all";
  currency?: string | "all";
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export type DocumentSortField =
  | "name"
  | "uploadedAt"
  | "amount"
  | "status"
  | "company";

export interface DocumentSort {
  field: DocumentSortField;
  direction: "asc" | "desc";
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DocumentListParams {
  filters?: DocumentFilters;
  sort?: DocumentSort;
  page?: number;
  pageSize?: number;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  icon: string;
  color: string;
}

export interface UpdateDocumentPayload {
  name?: string;
  categoryId?: string;
  documentType?: DocumentKind;
  tags?: string[];
  metadata?: Partial<DocumentMetadata>;
}
