import type { Document } from "./document";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessageStatus = "pending" | "streaming" | "complete" | "error";

/**
 * A document the assistant cited while answering. The backend will fill these
 * from the retrieval step; the shape mirrors a vector-store hit.
 */
export interface ChatSource {
  id: string;
  documentId: string;
  documentName: string;
  snippet: string;
  score: number;
  page?: number;
}

/** A structured document card rendered inside an assistant answer. */
export interface ChatDocumentResult {
  document: Document;
  reason?: string;
}

/**
 * A tool invocation performed by the assistant. Mirrors the MCP tool-call
 * shape so the UI does not change when real MCP tools are wired up.
 */
export interface ChatToolCall {
  id: string;
  tool: string;
  label: string;
  arguments: Record<string, unknown>;
  status: "running" | "completed" | "failed";
  resultSummary?: string;
  durationMs?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  status: ChatMessageStatus;
  sources?: ChatSource[];
  documents?: ChatDocumentResult[];
  toolCalls?: ChatToolCall[];
  feedback?: "up" | "down" | null;
  error?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  pinned?: boolean;
  preview?: string;
}

export interface SendMessagePayload {
  conversationId?: string;
  content: string;
  attachmentIds?: string[];
}

/**
 * Capabilities the assistant is allowed to use. In production these are MCP
 * tools exposed by the backend; the frontend only ever describes them.
 */
export interface AITool {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: "retrieval" | "metadata" | "analysis";
}
