import { config } from "@/lib/config";
import type {
  Document,
  DocumentCategory,
  DocumentListParams,
  DocumentSort,
  Paginated,
  UpdateDocumentPayload,
} from "@/types";
import { matchesDocumentFilters } from "./filters";
import { fileRegistry } from "./documentStore";
import { ApiError, http } from "./client";
import { mockLatency } from "./mockDelay";
import { mockStore } from "./mockStore";

function compare(a: Document, b: Document, sort: DocumentSort): number {
  const direction = sort.direction === "asc" ? 1 : -1;
  switch (sort.field) {
    case "name":
      return a.name.localeCompare(b.name) * direction;
    case "amount":
      return ((a.metadata?.amount ?? -1) - (b.metadata?.amount ?? -1)) * direction;
    case "status":
      return a.status.localeCompare(b.status) * direction;
    case "company":
      return (
        (a.metadata?.company ?? "").localeCompare(b.metadata?.company ?? "") *
        direction
      );
    case "uploadedAt":
    default:
      return (
        (new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()) *
        direction
      );
  }
}

export const documentsApi = {
  /** GET /documents */
  async list(params: DocumentListParams = {}): Promise<Paginated<Document>> {
    const {
      filters = {},
      sort = { field: "uploadedAt", direction: "desc" },
      page = 1,
      pageSize = 10,
    } = params;

    if (!config.useMockApi) {
      return http.get<Paginated<Document>>("/documents", {
        params: {
          ...filters,
          sortField: sort.field,
          sortDirection: sort.direction,
          page,
          pageSize,
        } as Record<string, string | number | boolean | undefined>,
      });
    }

    await mockLatency();
    const filtered = mockStore.documents
      .filter((doc) => matchesDocumentFilters(doc, filters))
      .sort((a, b) => compare(a, b, sort));

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      items: filtered.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  },

  /** GET /documents/:id */
  async get(id: string): Promise<Document> {
    if (!config.useMockApi) return http.get<Document>(`/documents/${id}`);

    await mockLatency();
    const found = mockStore.documents.find((doc) => doc.id === id);
    if (!found) throw new ApiError("Documentul nu a fost găsit.", 404);
    return found;
  },

  /** GET /documents?limit=n — convenience for dashboard widgets. */
  async recent(limit = 5): Promise<Document[]> {
    const { items } = await documentsApi.list({
      pageSize: limit,
      sort: { field: "uploadedAt", direction: "desc" },
    });
    return items;
  },

  /** PUT /documents/:id */
  async update(id: string, patch: UpdateDocumentPayload): Promise<Document> {
    if (!config.useMockApi)
      return http.put<Document>(`/documents/${id}`, patch);

    await mockLatency();
    const index = mockStore.documents.findIndex((doc) => doc.id === id);
    if (index === -1) throw new ApiError("Documentul nu a fost găsit.", 404);

    const current = mockStore.documents[index];
    const updated: Document = {
      ...current,
      ...patch,
      metadata: patch.metadata
        ? { ...current.metadata, ...patch.metadata }
        : current.metadata,
    };
    mockStore.documents[index] = updated;
    mockStore.persist();
    return updated;
  },

  /** DELETE /documents/:id */
  async remove(id: string): Promise<void> {
    if (!config.useMockApi) {
      await http.delete(`/documents/${id}`);
      return;
    }
    await mockLatency(200, 420);
    fileRegistry.release(id);
    mockStore.documents = mockStore.documents.filter((doc) => doc.id !== id);
    mockStore.persist();
  },

  /** DELETE /documents (bulk) */
  async removeMany(ids: string[]): Promise<void> {
    if (!config.useMockApi) {
      await http.post("/documents/bulk-delete", { ids });
      return;
    }
    await mockLatency(260, 500);
    const set = new Set(ids);
    ids.forEach((id) => fileRegistry.release(id));
    mockStore.documents = mockStore.documents.filter((doc) => !set.has(doc.id));
    mockStore.persist();
  },

  /** POST /documents/:id/move */
  async move(ids: string[], categoryId: string): Promise<void> {
    if (!config.useMockApi) {
      await http.post("/documents/move", { ids, categoryId });
      return;
    }
    await mockLatency();
    const set = new Set(ids);
    mockStore.documents = mockStore.documents.map((doc) =>
      set.has(doc.id) ? { ...doc, categoryId } : doc,
    );
    mockStore.persist();
  },

  /** POST /documents/:id/reprocess */
  async reprocess(id: string): Promise<Document> {
    if (!config.useMockApi)
      return http.post<Document>(`/documents/${id}/reprocess`);

    await mockLatency(300, 600);
    const index = mockStore.documents.findIndex((doc) => doc.id === id);
    if (index === -1) throw new ApiError("Documentul nu a fost găsit.", 404);
    const updated: Document = {
      ...mockStore.documents[index],
      status: "processing",
      processedAt: undefined,
      failureReason: undefined,
    };
    mockStore.documents[index] = updated;
    mockStore.persist();
    return updated;
  },

  /**
   * GET /documents/:id/file — the future backend returns a signed URL for the
   * viewer and the download action. Mocked as a rejected promise so the UI can
   * show an honest "preview not available yet" state.
   */
  async fileUrl(id: string): Promise<string | null> {
    if (!config.useMockApi)
      return (await http.get<{ url: string }>(`/documents/${id}/file`)).url;
    await mockLatency(120, 280);
    return null;
  },

  /** Distinct filter values, served by the backend as a facets endpoint. */
  async facets(): Promise<{
    companies: string[];
    currencies: string[];
    categories: DocumentCategory[];
  }> {
    if (!config.useMockApi) {
      return http.get("/documents/facets");
    }
    await mockLatency(120, 260);
    return {
      companies: Array.from(
        new Set(
          mockStore.documents
            .map((doc) => doc.metadata?.company)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort(),
      currencies: Array.from(
        new Set(
          mockStore.documents
            .map((doc) => doc.metadata?.currency)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort(),
      categories: mockStore.categories,
    };
  },
};
