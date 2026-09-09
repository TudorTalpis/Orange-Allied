import { config } from "@/lib/config";
import type {
  Document,
  InterpretedConstraint,
  QueryInterpretation,
  SearchQuery,
  SearchResponse,
  SearchResult,
} from "@/types";
import { http } from "./client";
import { matchesStructuredFilters } from "./filters";
import { mockLatency } from "./mockDelay";
import { mockStore } from "./mockStore";

/* ------------------------------------------------------------------ */
/*  Mock natural-language understanding                                */
/*  A handful of regular expressions stand in for the LLM query        */
/*  planner. The important part is the SHAPE of the response, which    */
/*  the real backend will reproduce.                                   */
/* ------------------------------------------------------------------ */

const CURRENCY_SYMBOLS: Record<string, string> = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
};

function interpret(query: string): QueryInterpretation | undefined {
  const constraints: InterpretedConstraint[] = [];
  const lower = query.toLowerCase();

  const typeMap: Array<[RegExp, string, string]> = [
    [/invoice/, "Tip document", "Invoice"],
    [/contract|agreement|nda|sow/, "Tip document", "Contract"],
    [/receipt/, "Tip document", "Receipt"],
    [/tax|vat/, "Tip document", "Tax document"],
    [/insurance|policy/, "Tip document", "Insurance policy"],
  ];
  for (const [pattern, field, value] of typeMap) {
    if (pattern.test(lower)) {
      constraints.push({ field, operator: "=", value, confidence: 0.94 });
      break;
    }
  }

  const amountMatch = lower.match(
    /(?:greater than|more than|above|over|>)\s*([$€£]?)\s*([\d,.]+)\s*(k)?/,
  );
  if (amountMatch) {
    const symbol = amountMatch[1];
    const raw = Number(amountMatch[2].replace(/,/g, ""));
    const value = amountMatch[3] ? raw * 1000 : raw;
    constraints.push({
      field: "Sumă",
      operator: ">",
      value: `${symbol || "$"}${value.toLocaleString()}`,
      confidence: 0.91,
    });
    if (symbol && CURRENCY_SYMBOLS[symbol]) {
      constraints.push({
        field: "Monedă",
        operator: "=",
        value: CURRENCY_SYMBOLS[symbol],
        confidence: 0.86,
      });
    }
  }

  const rangeMatch = lower.match(/(20\d{2})\s*[-–—]\s*(20\d{2})/);
  const singleYear = lower.match(/\b(20\d{2})\b/);
  if (rangeMatch) {
    constraints.push({
      field: "Dată",
      operator: "between",
      value: `${rangeMatch[1]}–${rangeMatch[2]}`,
      confidence: 0.95,
    });
  } else if (singleYear) {
    constraints.push({
      field: "Dată",
      operator: "=",
      value: singleYear[1],
      confidence: 0.93,
    });
  }

  const companyMatch = mockStore.documents.find((doc) =>
    doc.metadata?.company
      ? lower.includes(doc.metadata.company.toLowerCase().split(" ")[0])
      : false,
  );
  if (companyMatch?.metadata?.company) {
    constraints.push({
      field: "Companie",
      operator: "=",
      value: companyMatch.metadata.company,
      confidence: 0.88,
    });
  }

  if (constraints.length === 0) return undefined;

  return {
    summary: `Interpretat ca interogare structurată pe ${constraints.length} ${
      constraints.length === 1 ? "câmp" : "câmpuri"
    }.`,
    constraints,
    expandedQuery: query,
  };
}

function applyInterpretation(
  documents: Document[],
  interpretation: QueryInterpretation | undefined,
): Document[] {
  if (!interpretation) return documents;

  return documents.filter((doc) => {
    for (const constraint of interpretation.constraints) {
      if (constraint.field === "Tip document") {
        const wanted = constraint.value.toLowerCase().replace(/\s+/g, "_");
        if (!doc.documentType?.includes(wanted.split("_")[0])) return false;
      }
      if (constraint.field === "Sumă") {
        const threshold = Number(constraint.value.replace(/[^\d.]/g, ""));
        if ((doc.metadata?.amount ?? 0) <= threshold) return false;
      }
      if (constraint.field === "Dată") {
        const reference = doc.metadata?.date ?? doc.uploadedAt;
        if (constraint.operator === "between") {
          const [from, to] = constraint.value.split(/[–-]/);
          const year = Number(reference.slice(0, 4));
          if (year < Number(from) || year > Number(to)) return false;
        } else if (!reference.startsWith(constraint.value)) {
          return false;
        }
      }
      if (constraint.field === "Companie") {
        // The company is inferred from one token of the query, so it must not
        // exclude a document that names that company in its filename instead of
        // in its extracted metadata.
        const needle = constraint.value.toLowerCase().split(" ")[0];
        const haystack = `${doc.metadata?.company ?? ""} ${doc.name}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
    }
    return true;
  });
}

function lexicalScore(doc: Document, terms: string[]): number {
  const haystack = [
    doc.name,
    doc.aiSummary,
    doc.metadata?.company,
    doc.metadata?.customer,
    doc.metadata?.invoiceNumber,
    // The recognised text is what makes a document findable by its contents
    // rather than only by its filename.
    doc.extractedText,
    ...(doc.tags ?? []),
    ...(doc.metadata?.fields ?? []).map((field) => `${field.label} ${field.value}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (terms.length === 0) return 0.5;
  const hits = terms.filter((term) => haystack.includes(term)).length;
  return hits / terms.length;
}

function buildSnippet(doc: Document, terms: string[]): string {
  if (doc.aiSummary) {
    const sentences = doc.aiSummary.split(/(?<=\.)\s+/);
    const best =
      sentences.find((sentence) =>
        terms.some((term) => sentence.toLowerCase().includes(term)),
      ) ?? sentences[0];
    return best;
  }
  return `${doc.name} · încărcat la ${new Date(doc.uploadedAt).toLocaleDateString()} · încă neprocesat.`;
}

export const searchApi = {
  /** POST /search */
  async search(request: SearchQuery): Promise<SearchResponse> {
    if (!config.useMockApi)
      return http.post<SearchResponse>("/search", request);

    const start = performance.now();
    await mockLatency(420, 900);

    const terms = request.query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2 && !/^(the|and|with|from|for|all|any)$/.test(term));

    const interpretation =
      request.mode === "keyword" ? undefined : interpret(request.query);

    let candidates = mockStore.documents;
    candidates = applyInterpretation(candidates, interpretation);

    // Structured filters go through the shared predicate, so every control in
    // the filter bar — including the amount and date ranges — is applied here
    // exactly as it is on the documents list.
    if (request.filters) {
      candidates = candidates.filter((doc) =>
        matchesStructuredFilters(doc, request.filters),
      );
    }

    const results: SearchResult[] = candidates
      .map((doc) => {
        const lexical = lexicalScore(doc, terms);
        // Semantic mode gets a synthetic similarity floor so that
        // conceptually-related documents still surface without exact terms.
        const semanticFloor = request.mode === "keyword" ? 0 : 0.55;
        const score = Math.min(
          0.99,
          Math.max(lexical, interpretation ? 0.78 : semanticFloor * (0.7 + lexical * 0.5)),
        );

        const matches = (doc.metadata?.fields ?? [])
          .filter((field) =>
            terms.some((term) =>
              String(field.value).toLowerCase().includes(term) ||
              field.label.toLowerCase().includes(term),
            ),
          )
          .slice(0, 3)
          .map((field) => ({
            field: field.label,
            snippet: Array.isArray(field.value)
              ? field.value.join(", ")
              : String(field.value),
          }));

        return {
          document: doc,
          score,
          snippet: buildSnippet(doc, terms),
          matches,
          page: doc.metadata?.fields?.[0]?.page,
        };
      })
      .filter((result) =>
        request.mode === "keyword" ? result.score > 0 : result.score > 0.5,
      )
      .sort((a, b) => b.score - a.score);

    const pageSize = request.pageSize ?? 10;
    const page = request.page ?? 1;

    return {
      results: results.slice((page - 1) * pageSize, page * pageSize),
      total: results.length,
      tookMs: Math.round(performance.now() - start),
      mode: request.mode,
      interpretation,
      suggestions:
        results.length === 0
          ? [
              "Facturi peste $25,000",
              "Contracte care menționează GDPR",
              "Chitanțe din august 2026",
            ]
          : undefined,
    };
  },
};
