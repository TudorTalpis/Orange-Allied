import type { Document, DocumentFilters } from "@/types";

/**
 * The single definition of what a document filter means.
 *
 * Both the document list (`documentsApi.list`) and search (`searchApi.search`)
 * resolve filters through here, so a control added to the filter bar behaves
 * identically on /documents and /search instead of being honoured by one and
 * silently ignored by the other.
 */

/** Free-text match over the fields a user would expect to search by name. */
export function matchesQuery(doc: Document, query: string | undefined): boolean {
  if (!query) return true;

  const haystack = [
    doc.name,
    doc.metadata?.company,
    doc.metadata?.invoiceNumber,
    doc.metadata?.customer,
    doc.aiSummary,
    doc.extractedText,
    ...(doc.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

/**
 * Structured (non-text) filters: type, class, category, status, company,
 * currency, amount range and date range. `query` is deliberately excluded —
 * search scores relevance itself rather than filtering on the raw term.
 */
export function matchesStructuredFilters(
  doc: Document,
  filters: DocumentFilters = {},
): boolean {
  const {
    type,
    documentType,
    categoryId,
    status,
    company,
    currency,
    amountMin,
    amountMax,
    dateFrom,
    dateTo,
  } = filters;

  if (type && type !== "all" && doc.type !== type) return false;
  if (documentType && documentType !== "all" && doc.documentType !== documentType) {
    return false;
  }
  if (categoryId && categoryId !== "all" && doc.categoryId !== categoryId) {
    return false;
  }
  if (status && status !== "all" && doc.status !== status) return false;
  if (company && company !== "all" && doc.metadata?.company !== company) {
    return false;
  }
  if (currency && currency !== "all" && doc.metadata?.currency !== currency) {
    return false;
  }

  // A document with no extracted amount cannot satisfy an amount bound.
  const amount = doc.metadata?.amount;
  if (amountMin !== undefined && (amount === undefined || amount < amountMin)) {
    return false;
  }
  if (amountMax !== undefined && (amount === undefined || amount > amountMax)) {
    return false;
  }

  // Prefer the document's own date; fall back to when it was uploaded.
  const reference = doc.metadata?.date ?? doc.uploadedAt;
  if (dateFrom && reference < dateFrom) return false;
  if (dateTo && reference > `${dateTo}T23:59:59.999Z`) return false;

  return true;
}

/** Everything at once — used by the document list. */
export function matchesDocumentFilters(
  doc: Document,
  filters: DocumentFilters = {},
): boolean {
  return matchesQuery(doc, filters.query) && matchesStructuredFilters(doc, filters);
}
