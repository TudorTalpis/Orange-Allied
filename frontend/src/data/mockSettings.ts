import type { AIModelOption, AppSettings } from "@/types";

export const cloudModels: AIModelOption[] = [
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    contextWindow: 128_000,
    description: "Echilibru între calitate și latență pentru extragere și chat zilnic.",
    recommended: true,
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    provider: "openai",
    contextWindow: 128_000,
    description: "Cea mai ieftină opțiune cloud; potrivită doar pentru clasificare.",
  },
  {
    id: "claude-sonnet-4",
    label: "Claude Sonnet 4",
    provider: "anthropic",
    contextWindow: 200_000,
    description: "Raționament solid pe documente lungi; ideal pentru analiza contractelor.",
    recommended: true,
  },
  {
    id: "claude-haiku-4",
    label: "Claude Haiku 4",
    provider: "anthropic",
    contextWindow: 200_000,
    description: "Răspunsuri rapide peste metadatele deja extrase.",
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    provider: "google",
    contextWindow: 1_000_000,
    description: "Context foarte mare; util pentru rezumarea rapoartelor întregi.",
  },
  {
    id: "mistral-large",
    label: "Mistral Large",
    provider: "mistral",
    contextWindow: 128_000,
    description: "Opțiune găzduită în UE, pentru spații sensibile la rezidența datelor.",
  },
];

export const localModels: AIModelOption[] = [
  {
    id: "llama3.1:8b",
    label: "Llama 3.1 8B",
    provider: "ollama",
    contextWindow: 128_000,
    description: "Rulează lejer pe un laptop; extragere generală bună.",
    recommended: true,
  },
  {
    id: "qwen2.5:14b",
    label: "Qwen 2.5 14B",
    provider: "ollama",
    contextWindow: 32_000,
    description: "Citire multilingvă mai bună, inclusiv în română.",
  },
  {
    id: "mistral-nemo:12b",
    label: "Mistral Nemo 12B",
    provider: "ollama",
    contextWindow: 128_000,
    description: "Respectă bine formatul structurat cerut la extragerea câmpurilor.",
  },
  {
    id: "phi4:14b",
    label: "Phi-4 14B",
    provider: "ollama",
    contextWindow: 16_000,
    description: "Model compact de raționament pentru sarcini de clasificare.",
  },
];

export const ocrProviders = [
  {
    id: "tesseract" as const,
    label: "Tesseract",
    description: "Open source, rulează local, niciun fel de date nu părăsesc mașina.",
  },
  {
    id: "paddleocr" as const,
    label: "PaddleOCR",
    description: "Acuratețe mai bună pe documente fotografiate și rotite.",
  },
  {
    id: "azure" as const,
    label: "Azure Document Intelligence",
    description: "Serviciu cloud cu recunoaștere de layout și tabele.",
  },
  {
    id: "textract" as const,
    label: "AWS Textract",
    description: "Serviciu cloud cu extragere puternică din formulare și tabele.",
  },
];

export const embeddingProviders = [
  {
    id: "openai" as const,
    label: "OpenAI text-embedding-3",
    description: "1.536 de dimensiuni, găzduit în cloud.",
  },
  {
    id: "voyage" as const,
    label: "Voyage AI",
    description: "Optimizat pentru căutare în documente de business lungi.",
  },
  {
    id: "nomic-local" as const,
    label: "Nomic Embed (local)",
    description: "768 de dimensiuni, servit prin Ollama.",
  },
  {
    id: "bge-local" as const,
    label: "BGE-M3 (local)",
    description: "Multilingv, foarte bun pe corpusuri mixte româno-engleze.",
  },
];

export const mockSettings: AppSettings = {
  ai: {
    providerKind: "cloud",
    cloudProvider: "anthropic",
    cloudModel: "claude-sonnet-4",
    localProvider: "ollama",
    localModel: "llama3.1:8b",
    localEndpoint: "http://localhost:11434",
    temperature: 0.2,
    maxTokens: 2_048,
    keepDataLocal: false,
    streamResponses: true,
    citationsEnabled: true,
  },
  processing: {
    ocrProvider: "tesseract",
    ocrLanguages: ["en", "ro"],
    embeddingProvider: "openai",
    embeddingModel: "text-embedding-3-small",
    chunkSize: 800,
    chunkOverlap: 120,
    autoProcessOnUpload: true,
    autoClassify: true,
    requireReviewBelowConfidence: 0.7,
    retryFailedJobs: true,
  },
  appearance: {
    theme: "dark",
    accent: "burgundy",
    density: "comfortable",
    reduceMotion: false,
    sidebarCollapsed: false,
  },
  storage: {
    usedBytes: 5_153_960_755,
    quotaBytes: 8_589_934_592,
    documentCount: 1248,
    breakdown: [
      { label: "Documente originale", bytes: 3_951_369_912 },
      { label: "Previzualizări generate", bytes: 687_194_767 },
      { label: "Straturi de text OCR", bytes: 322_122_547 },
      { label: "Index vectorial", bytes: 193_273_529 },
    ],
    retentionDays: 365,
  },
  security: {
    twoFactorEnabled: true,
    passwordUpdatedAt: "2026-05-18T10:22:00.000Z",
  },
  notifications: {
    processingComplete: true,
    processingFailed: true,
    weeklyDigest: false,
    productUpdates: true,
  },
  connectedServices: [
    {
      id: "svc_gdrive",
      name: "Google Drive",
      description: "Importă documente din folderele Drive selectate.",
      icon: "hard-drive",
      connected: true,
      lastSyncedAt: "2026-09-07T06:00:00.000Z",
    },
    {
      id: "svc_dropbox",
      name: "Dropbox",
      description: "Urmărește un folder Dropbox și preia automat fișierele noi.",
      icon: "package",
      connected: false,
    },
    {
      id: "svc_ollama",
      name: "Ollama",
      description: "Runtime local de modele, folosit când procesarea rămâne pe infrastructura proprie.",
      icon: "cpu",
      connected: true,
      lastSyncedAt: "2026-09-07T08:55:00.000Z",
    },
    {
      id: "svc_smtp",
      name: "Preluare din e-mail",
      description: "Redirecționează facturile către o adresă dedicată pentru încărcare automată.",
      icon: "mail",
      connected: false,
    },
  ],
};
