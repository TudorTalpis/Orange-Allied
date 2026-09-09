import type { Document, DocumentFilters } from "./document";

export type SearchMode = "keyword" | "semantic" | "hybrid";

export interface SearchQuery {
  query: string;
  mode: SearchMode;
  filters?: DocumentFilters;
  page?: number;
  pageSize?: number;
}

/**
 * How the AI understood a natural-language query. Rendering this back to the
 * user is what makes semantic search trustworthy rather than magical.
 */
export interface InterpretedConstraint {
  field: string;
  operator: string;
  value: string;
  confidence: number;
}

export interface QueryInterpretation {
  summary: string;
  constraints: InterpretedConstraint[];
  /** Rewritten query actually sent to the vector store. */
  expandedQuery?: string;
}

export interface SearchMatch {
  field: string;
  snippet: string;
}

export interface SearchResult {
  document: Document;
  /** 0–1 cosine similarity for semantic results, lexical score otherwise. */
  score: number;
  snippet: string;
  matches: SearchMatch[];
  page?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  tookMs: number;
  mode: SearchMode;
  interpretation?: QueryInterpretation;
  suggestions?: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  mode: SearchMode;
  createdAt: string;
}
