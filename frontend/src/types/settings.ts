export type AIProviderKind = "cloud" | "local";

export type CloudProviderId = "openai" | "anthropic" | "google" | "mistral";
export type LocalProviderId = "ollama" | "llamacpp";

export interface AIModelOption {
  id: string;
  label: string;
  provider: CloudProviderId | LocalProviderId;
  contextWindow: number;
  description: string;
  recommended?: boolean;
}

export interface AISettings {
  providerKind: AIProviderKind;
  cloudProvider: CloudProviderId;
  cloudModel: string;
  localProvider: LocalProviderId;
  localModel: string;
  localEndpoint: string;
  temperature: number;
  maxTokens: number;
  /** Keep every byte on-premise; disables cloud provider selection. */
  keepDataLocal: boolean;
  streamResponses: boolean;
  citationsEnabled: boolean;
}

export type OcrProviderId = "tesseract" | "paddleocr" | "azure" | "textract";
export type EmbeddingProviderId =
  | "openai"
  | "voyage"
  | "nomic-local"
  | "bge-local";

export interface ProcessingSettings {
  ocrProvider: OcrProviderId;
  ocrLanguages: string[];
  embeddingProvider: EmbeddingProviderId;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  autoProcessOnUpload: boolean;
  autoClassify: boolean;
  requireReviewBelowConfidence: number;
  retryFailedJobs: boolean;
}

export interface AppearanceSettings {
  theme: "dark" | "system";
  accent: "burgundy" | "crimson" | "slate";
  density: "comfortable" | "compact";
  reduceMotion: boolean;
  sidebarCollapsed: boolean;
}

export interface StorageSettings {
  usedBytes: number;
  quotaBytes: number;
  documentCount: number;
  breakdown: Array<{ label: string; bytes: number }>;
  retentionDays: number;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordUpdatedAt: string;
}

export interface ConnectedService {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSyncedAt?: string;
}

export interface NotificationSettings {
  processingComplete: boolean;
  processingFailed: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
}

export interface AppSettings {
  ai: AISettings;
  processing: ProcessingSettings;
  appearance: AppearanceSettings;
  storage: StorageSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  connectedServices: ConnectedService[];
}
