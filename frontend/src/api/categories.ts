import { config } from "@/lib/config";
import { uid } from "@/lib/utils";
import type { CreateCategoryPayload, DocumentCategory } from "@/types";
import { ApiError, http } from "./client";
import { mockLatency } from "./mockDelay";
import { mockStore } from "./mockStore";

export const categoriesApi = {
  /** GET /categories */
  async list(): Promise<DocumentCategory[]> {
    if (!config.useMockApi) return http.get<DocumentCategory[]>("/categories");
    await mockLatency();
    return mockStore.categories;
  },

  /** GET /categories/:id */
  async get(id: string): Promise<DocumentCategory> {
    if (!config.useMockApi)
      return http.get<DocumentCategory>(`/categories/${id}`);
    await mockLatency(160, 320);
    const found = mockStore.categories.find((category) => category.id === id);
    if (!found) throw new ApiError("Categoria nu a fost găsită.", 404);
    return found;
  },

  /** POST /categories */
  async create(payload: CreateCategoryPayload): Promise<DocumentCategory> {
    if (!config.useMockApi)
      return http.post<DocumentCategory>("/categories", payload);

    await mockLatency(320, 640);
    const exists = mockStore.categories.some(
      (category) =>
        category.name.toLowerCase() === payload.name.trim().toLowerCase(),
    );
    if (exists) throw new ApiError("Există deja o categorie cu acest nume.", 409);

    const category: DocumentCategory = {
      id: uid("cat"),
      name: payload.name.trim(),
      description: payload.description?.trim(),
      icon: payload.icon,
      color: payload.color,
      documentCount: 0,
      updatedAt: new Date().toISOString(),
    };
    mockStore.categories = [...mockStore.categories, category];
    return category;
  },

  /** PUT /categories/:id */
  async update(
    id: string,
    patch: Partial<CreateCategoryPayload>,
  ): Promise<DocumentCategory> {
    if (!config.useMockApi)
      return http.put<DocumentCategory>(`/categories/${id}`, patch);

    await mockLatency();
    const index = mockStore.categories.findIndex(
      (category) => category.id === id,
    );
    if (index === -1) throw new ApiError("Categoria nu a fost găsită.", 404);

    const updated: DocumentCategory = {
      ...mockStore.categories[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    mockStore.categories[index] = updated;
    return updated;
  },

  /** DELETE /categories/:id */
  async remove(id: string): Promise<void> {
    if (!config.useMockApi) {
      await http.delete(`/categories/${id}`);
      return;
    }
    await mockLatency(220, 460);
    const category = mockStore.categories.find((item) => item.id === id);
    if (category?.system) {
      throw new ApiError("Categoriile de sistem nu pot fi șterse.", 403);
    }
    mockStore.categories = mockStore.categories.filter(
      (item) => item.id !== id,
    );
    mockStore.documents = mockStore.documents.map((doc) =>
      doc.categoryId === id ? { ...doc, categoryId: undefined } : doc,
    );
  },
};
