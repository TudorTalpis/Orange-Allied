import { mockCategories } from "@/data/mockCategories";
import { mockDocuments } from "@/data/mockDocuments";
import {
  mockProcessingEvents,
  mockProcessingJobs,
} from "@/data/mockProcessing";
import { mockSettings } from "@/data/mockSettings";
import { mockNotifications } from "@/data/mockUser";
import { mockConversations, mockMessages } from "@/data/mockChat";
import type {
  AppNotification,
  AppSettings,
  ChatConversation,
  ChatMessage,
  Document,
  DocumentCategory,
  ProcessingEvent,
  ProcessingJob,
} from "@/types";

import { loadUploadedDocuments, saveUploadedDocuments } from "./documentStore";

function clone<T>(value: T): T {
  return structuredClone(value);
}

/** Seeded fixtures plus anything the user uploaded in an earlier session. */
function initialDocuments(): Document[] {
  const seeded = clone(mockDocuments).map((doc) => ({
    ...doc,
    source: "seed" as const,
  }));
  return [...loadUploadedDocuments(), ...seeded];
}

/**
 * A single in-memory store shared by every mock service so that mutations made
 * on one page (uploading, deleting, renaming) are visible on the others for the
 * lifetime of the browser session. It is the seam the real backend replaces.
 */
export const mockStore = {
  documents: initialDocuments(),
  categories: clone(mockCategories) as DocumentCategory[],
  jobs: clone(mockProcessingJobs) as ProcessingJob[],
  events: clone(mockProcessingEvents) as ProcessingEvent[],
  notifications: clone(mockNotifications) as AppNotification[],
  conversations: clone(mockConversations) as ChatConversation[],
  messages: clone(mockMessages) as Record<string, ChatMessage[]>,
  settings: clone(mockSettings) as AppSettings,

  /** Call after any mutation that touches uploaded documents. */
  persist() {
    saveUploadedDocuments(mockStore.documents);
  },
};
