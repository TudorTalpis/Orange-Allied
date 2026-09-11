import type { Document } from "@/types";

/**
 * Local persistence for documents the user uploaded during the demo.
 *
 * Only uploaded records are stored: the seeded fixtures ship with the build and
 * re-persisting them would just duplicate them on every load. File contents are
 * deliberately NOT persisted — object URLs do not survive a reload — so a
 * refreshed session keeps the document and its extraction but falls back to the
 * placeholder preview.
 */
const STORAGE_KEY = "docuai.uploaded-documents";

export function loadUploadedDocuments(): Document[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Document[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUploadedDocuments(documents: Document[]): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(documents.filter((doc) => doc.source === "upload")),
    );
  } catch {
    /* storage full or unavailable — the demo still works for this session */
  }
}

/**
 * Object URLs for files uploaded in THIS session, so the viewer can show the
 * real image or PDF. Kept out of the persisted payload on purpose.
 */
const objectUrls = new Map<string, string>();

export const fileRegistry = {
  set(documentId: string, file: File): string {
    const url = URL.createObjectURL(file);
    const previous = objectUrls.get(documentId);
    if (previous) URL.revokeObjectURL(previous);
    objectUrls.set(documentId, url);
    return url;
  },
  get(documentId: string): string | undefined {
    return objectUrls.get(documentId);
  },
  release(documentId: string): void {
    const url = objectUrls.get(documentId);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrls.delete(documentId);
    }
  },
};
