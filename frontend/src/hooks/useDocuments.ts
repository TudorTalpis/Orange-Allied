import { useCallback, useMemo, useState } from "react";
import { documentsApi } from "@/api";
import type {
  Document,
  DocumentFilters,
  DocumentSort,
  Paginated,
} from "@/types";
import { useAsync } from "./useAsync";
import { useDebouncedValue } from "./useDebouncedValue";

export const emptyFilters: DocumentFilters = {
  query: "",
  type: "all",
  documentType: "all",
  categoryId: "all",
  status: "all",
  company: "all",
  currency: "all",
};

export function countActiveFilters(filters: DocumentFilters): number {
  let count = 0;
  for (const [key, value] of Object.entries(filters)) {
    if (key === "query") continue;
    if (value === undefined || value === "" || value === "all") continue;
    count += 1;
  }
  return count;
}

/**
 * Owns the documents list: filters, sorting, pagination and reloads. Pages
 * consume the result rather than talking to the service directly.
 *
 * `initialFilters` seeds the state once, so a caller can open the list already
 * filtered — for example from a category card's deep link.
 */
export function useDocuments(
  pageSize = 10,
  initialFilters?: Partial<DocumentFilters>,
) {
  const [filters, setFilters] = useState<DocumentFilters>(() => ({
    ...emptyFilters,
    ...initialFilters,
  }));
  const [sort, setSort] = useState<DocumentSort>({
    field: "uploadedAt",
    direction: "desc",
  });
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebouncedValue(filters.query ?? "", 320);
  const effectiveFilters = useMemo(
    () => ({ ...filters, query: debouncedQuery }),
    [filters, debouncedQuery],
  );

  const request = useAsync<Paginated<Document>>(
    () => documentsApi.list({ filters: effectiveFilters, sort, page, pageSize }),
    [JSON.stringify(effectiveFilters), sort.field, sort.direction, page, pageSize],
  );

  const updateFilters = useCallback((patch: Partial<DocumentFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(emptyFilters);
    setPage(1);
  }, []);

  /** Replaces the whole filter set — used when the URL drives the list. */
  const replaceFilters = useCallback((next: Partial<DocumentFilters>) => {
    setFilters({ ...emptyFilters, ...next });
    setPage(1);
  }, []);

  const toggleSort = useCallback((field: DocumentSort["field"]) => {
    setSort((current) =>
      current.field === field
        ? { field, direction: current.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" },
    );
    setPage(1);
  }, []);

  return {
    ...request,
    filters,
    sort,
    page,
    setPage,
    updateFilters,
    resetFilters,
    replaceFilters,
    toggleSort,
    activeFilterCount: countActiveFilters(filters),
  };
}
