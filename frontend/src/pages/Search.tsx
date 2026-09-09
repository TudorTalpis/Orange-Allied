import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bot, Search as SearchIcon, SearchX } from "lucide-react";
import { searchApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { DocumentFiltersBar } from "@/components/documents/document-filters";
import { SearchModeToggle } from "@/components/search/search-mode-toggle";
import { QueryInterpretationCard } from "@/components/search/query-interpretation";
import { SearchResultCard } from "@/components/search/search-result-card";
import { emptyFilters, countActiveFilters } from "@/hooks/useDocuments";
import type { DocumentFilters, SearchMode, SearchResponse } from "@/types";

const examples = [
  "Contracte care menționează GDPR",
  "Facturi din 2025–2026 cu un total mai mare de $25,000",
  "Chitanțe din august 2026",
  "Documente de la Acme Corporation",
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [mode, setMode] = useState<SearchMode>(
    (params.get("mode") as SearchMode) ?? "hybrid",
  );
  const [filters, setFilters] = useState<DocumentFilters>(emptyFilters);

  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(
    async (nextQuery: string, nextMode: SearchMode, nextFilters: DocumentFilters) => {
      if (!nextQuery.trim()) return;
      setLoading(true);
      setError(null);
      setSearched(true);
      try {
        const result = await searchApi.search({
          query: nextQuery,
          mode: nextMode,
          filters: nextFilters,
        });
        setResponse(result);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Căutarea a eșuat.");
        setResponse(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Run the search that arrives in the URL (from the header search box).
  useEffect(() => {
    const initial = params.get("q");
    if (initial) void runSearch(initial, mode, emptyFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setParams(query.trim() ? { q: query.trim(), mode } : {}, { replace: true });
    void runSearch(query, mode, filters);
  }

  function handleModeChange(nextMode: SearchMode) {
    setMode(nextMode);
    if (searched) void runSearch(query, nextMode, filters);
  }

  function handleFilterChange(patch: Partial<DocumentFilters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (searched) void runSearch(query, mode, next);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Căutare"
        description="Găsește documente după termeni exacți, după sens sau ambele deodată."
        actions={
          <Button variant="secondary" asChild>
            <Link to="/chat">
              <Bot />
              Întreabă asistentul
            </Link>
          </Button>
        }
      />

      <Card className="p-4">
        <form onSubmit={handleSubmit} role="search" className="space-y-3">
          <div className="relative">
            <label htmlFor="search-input" className="sr-only">
              Caută în documentele tale
            </label>
            <SearchIcon
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden
            />
            <input
              id="search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Caută în documentele tale…"
              className="h-11 w-full rounded-lg border border-border bg-input pl-10 pr-28 text-sm transition-colors placeholder:text-subtle-foreground hover:border-border-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {/*
              Positioned with a static offset rather than -translate-y-1/2:
              the button's own `active:translate-y-px` overrides a positional
              translate on press, which moved the button out from under the
              cursor so mouseup — and therefore the click — never landed.
              The input is h-11 and the button h-8, so 6px centres it.
            */}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="absolute right-2 top-1.5"
              loading={loading}
            >
              Caută
            </Button>
          </div>

          <SearchModeToggle value={mode} onChange={handleModeChange} />
        </form>
      </Card>

      <DocumentFiltersBar
        filters={filters}
        activeCount={countActiveFilters(filters)}
        onChange={handleFilterChange}
        onReset={() => {
          setFilters(emptyFilters);
          if (searched) void runSearch(query, mode, emptyFilters);
        }}
      />

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-card" />
          ))}
        </div>
      )}

      {!loading && error && (
        <ErrorState
          title="Căutarea nu a putut fi finalizată"
          message={error}
          onRetry={() => runSearch(query, mode, filters)}
        />
      )}

      {!loading && !error && !searched && (
        <div className="space-y-4">
          <EmptyState
            icon={SearchIcon}
            title="Caută în colecția ta"
            description="Scrie o expresie, o companie, un număr de factură — sau întreabă în limbaj natural și lasă AI-ul să transforme totul în filtre."
          />
          <div>
            <p className="mb-2 text-[12px] text-subtle-foreground">Încearcă una dintre acestea</p>
            <ul className="flex flex-wrap gap-1.5">
              {examples.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(example);
                      void runSearch(example, mode, filters);
                    }}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-primary-border hover:bg-primary-subtle hover:text-foreground"
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!loading && !error && response && (
        <div className="space-y-4">
          {response.interpretation && (
            <QueryInterpretationCard interpretation={response.interpretation} />
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] text-muted-foreground">
              <span className="font-medium text-foreground tabular-nums">
                {response.total}
              </span>{" "}
              {response.total === 1 ? "rezultat" : "rezultate"}
            </p>
            <p className="font-mono text-[11px] text-subtle-foreground tabular-nums">
              {response.mode} · {response.tookMs} ms
            </p>
          </div>

          {response.results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Niciun document găsit"
              description="Încearcă să schimbi filtrele sau interogarea. Modul semantic găsește adesea documente pe care modul cuvinte-cheie le ratează."
              action={
                mode !== "semantic" ? (
                  <Button variant="secondary" onClick={() => handleModeChange("semantic")}>
                    Încearcă căutarea semantică
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ul className="space-y-3">
              {response.results.map((result) => (
                <li key={result.document.id}>
                  <SearchResultCard result={result} />
                </li>
              ))}
            </ul>
          )}

          {response.suggestions && response.suggestions.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] text-subtle-foreground">
                Căutări care returnează rezultate
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {response.suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(suggestion);
                        void runSearch(suggestion, mode, filters);
                      }}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-primary-border hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
