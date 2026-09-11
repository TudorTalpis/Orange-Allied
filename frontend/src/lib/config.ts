/**
 * Runtime configuration. Everything the frontend needs to talk to the future
 * FastAPI backend is read from Vite environment variables so that no host is
 * ever hard-coded inside a component.
 */
export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  /**
   * While the backend does not exist, every service module resolves against
   * the in-memory mock layer. Flipping this to "false" (VITE_USE_MOCK_API)
   * routes the exact same service calls through the HTTP client instead.
   */
  useMockApi: (import.meta.env.VITE_USE_MOCK_API ?? "true") !== "false",
  appName: "DocuAI",
  appTagline: "Platformă inteligentă de documente",
  maxUploadBytes: 50 * 1024 * 1024,
  acceptedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const,
  acceptedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".docx"] as const,
} as const;
