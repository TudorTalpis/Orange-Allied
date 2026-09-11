import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  FileX2,
  FolderInput,
  Files,
  LayoutGrid,
  List,
  Trash2,
  Upload,
} from "lucide-react";
import { categoriesApi, documentsApi } from "@/api";
import { useDocuments } from "@/hooks/useDocuments";
import { useAsync } from "@/hooks/useAsync";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingCards, LoadingRows } from "@/components/common/loading-state";
import { Pagination } from "@/components/common/pagination";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DocumentFiltersBar } from "@/components/documents/document-filters";
import { DocumentTable } from "@/components/documents/document-table";
import { DocumentCard } from "@/components/documents/document-card";
import { DocumentPreview } from "@/components/documents/document-preview";
import { MoveDialog } from "@/components/documents/move-dialog";
import { RenameDialog } from "@/components/documents/rename-dialog";
import type { Document, DocumentFilters } from "@/types";
import { cn } from "@/lib/utils";

type ViewMode = "table" | "grid";
const VIEW_KEY = "docuai.documents-view";

export default function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep links (a category card's "Open", a notification) arrive as query
  // parameters and must show up as real, visible filter selections.
  const urlFilters = useMemo<Partial<DocumentFilters>>(() => {
    const next: Partial<DocumentFilters> = {};
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const company = searchParams.get("company");
    const query = searchParams.get("q");
    if (category) next.categoryId = category;
    if (status) next.status = status as DocumentFilters["status"];
    if (type) next.type = type as DocumentFilters["type"];
    if (company) next.company = company;
    if (query) next.query = query;
    return next;
  }, [searchParams]);

  const list = useDocuments(10, urlFilters);
  const categories = useAsync(() => categoriesApi.list(), []);
  const appliedUrlKey = useRef(searchParams.toString());

  const [view, setView] = useState<ViewMode>(() => {
    try {
      return (window.localStorage.getItem(VIEW_KEY) as ViewMode) ?? "table";
    } catch {
      return "table";
    }
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [renameDoc, setRenameDoc] = useState<Document | null>(null);
  const [moveTargets, setMoveTargets] = useState<string[] | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<string[] | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* ignore */
    }
  }, [view]);

  // A page change must not carry a stale selection into different rows.
  useEffect(() => setSelected(new Set()), [list.page]);

  // Re-seed when the URL changes after mount — arriving from Categories while
  // the page is already open must still apply the filter.
  const { replaceFilters } = list;
  useEffect(() => {
    const key = searchParams.toString();
    if (key === appliedUrlKey.current) return;
    appliedUrlKey.current = key;
    replaceFilters(urlFilters);
  }, [searchParams, urlFilters, replaceFilters]);

  const documents = list.data?.items ?? [];

  function toggleSelect(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((current) =>
      current.size === documents.length
        ? new Set()
        : new Set(documents.map((doc) => doc.id)),
    );
  }

  /** Clearing must also drop the deep-link parameters, or they reapply. */
  function clearAllFilters() {
    if (searchParams.toString()) {
      appliedUrlKey.current = "";
      setSearchParams({}, { replace: true });
    }
    list.resetFilters();
  }

  function handleDownload(doc: Document) {
    toast.info("Descărcarea va fi disponibilă odată cu backendul", {
      description: `${doc.name} este stocat doar ca metadate în acest prototip.`,
    });
  }

  async function handleRename(name: string) {
    if (!renameDoc) return;
    await documentsApi.update(renameDoc.id, { name });
    toast.success("Documentul a fost redenumit");
    list.reload();
  }

  async function handleMove(categoryId: string) {
    if (!moveTargets) return;
    await documentsApi.move(moveTargets, categoryId);
    toast.success(
      moveTargets.length === 1
        ? "Documentul a fost mutat"
        : `${moveTargets.length} documente au fost mutate`,
    );
    setSelected(new Set());
    list.reload();
  }

  async function handleDelete() {
    if (!deleteTargets) return;
    await documentsApi.removeMany(deleteTargets);
    toast.success(
      deleteTargets.length === 1
        ? "Documentul a fost șters"
        : `${deleteTargets.length} documente au fost șterse`,
    );
    setSelected(new Set());
    list.reload();
  }

  async function handleReprocess(doc: Document) {
    await documentsApi.reprocess(doc.id);
    toast.success("Procesarea a fost repusă în coadă", {
      description: `${doc.name} reintră în flux la etapa OCR.`,
    });
    list.reload();
  }

  const handlers = {
    onPreview: setPreviewDoc,
    onRename: setRenameDoc,
    onMove: (doc: Document) => setMoveTargets([doc.id]),
    onDelete: (doc: Document) => setDeleteTargets([doc.id]),
    onReprocess: handleReprocess,
    onDownload: handleDownload,
  };

  const hasFilters = list.activeFilterCount > 0 || Boolean(list.filters.query);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Documente"
        description="Gestionează și organizează colecția de documente."
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link to="/upload">
                <Upload />
                Încărcare în masă
              </Link>
            </Button>
            <Button variant="primary" asChild>
              <Link to="/upload">
                <Upload />
                Încarcă document
              </Link>
            </Button>
          </>
        }
      />

      <DocumentFiltersBar
        filters={list.filters}
        activeCount={list.activeFilterCount}
        onChange={list.updateFilters}
        onReset={clearAllFilters}
        trailing={
          <div
            className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5"
            role="group"
          aria-label="Mod de afișare"
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
              aria-label="Afișare tabel"
              className={cn(view === "table" && "bg-surface-overlay text-foreground")}
            >
              <List />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Afișare grilă"
              className={cn(view === "grid" && "bg-surface-overlay text-foreground")}
            >
              <LayoutGrid />
            </Button>
          </div>
        }
      />

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary-border bg-primary-subtle px-3 py-2 animate-rise">
          <p className="text-[13px]">
            <span className="font-medium">{selected.size}</span> selectate
          </p>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMoveTargets([...selected])}
            >
              <FolderInput />
              Mută
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteTargets([...selected])}
            >
              <Trash2 />
              Șterge
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Anulează
            </Button>
          </div>
        </div>
      )}

      {list.error && (
        <ErrorState
          title="Documentele nu au putut fi încărcate"
          message={list.error}
          onRetry={list.reload}
        />
      )}

      {!list.error && (
        <Card className="overflow-hidden">
          {list.loading &&
            (view === "table" ? (
              <LoadingRows rows={8} />
            ) : (
              <LoadingCards
                count={8}
                className="grid-cols-1 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              />
            ))}

          {!list.loading && documents.length === 0 && (
            <div className="p-4">
              <EmptyState
                icon={hasFilters ? FileX2 : Files}
                title={
                  hasFilters ? "Niciun document nu corespunde filtrelor" : "Biblioteca ta de documente este goală"
                }
                description={
                  hasFilters
                    ? "Încearcă un alt termen de căutare sau resetează filtrele pentru a vedea toate documentele."
                    : "Încarcă primul document pentru a începe — sunt acceptate PDF-uri, fotografii și scanări."
                }
                action={
                  hasFilters ? (
                    <Button variant="secondary" onClick={clearAllFilters}>
                      Resetează filtrele
                    </Button>
                  ) : (
                    <Button variant="primary" asChild>
                      <Link to="/upload">
                        <Upload />
                        Încarcă document
                      </Link>
                    </Button>
                  )
                }
                className="border-0"
              />
            </div>
          )}

          {!list.loading && documents.length > 0 && (
            <>
              {/*
                Below md the table would need horizontal scrolling to stay
                readable, so the same rows are rendered as cards instead —
                the layout adapts rather than shrinking.
              */}
              {view === "table" && (
                <div className="hidden md:block">
                  <DocumentTable
                    documents={documents}
                    categories={categories.data ?? []}
                    sort={list.sort}
                    onSort={list.toggleSort}
                    selected={selected}
                    onToggleSelect={toggleSelect}
                    onToggleAll={toggleAll}
                    handlers={handlers}
                  />
                </div>
              )}

              <div
                className={cn(
                  "grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                  view === "table" && "md:hidden",
                )}
              >
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    categories={categories.data ?? []}
                    selected={selected.has(doc.id)}
                    onToggleSelect={toggleSelect}
                    handlers={handlers}
                  />
                ))}
              </div>

              {list.data && (
                <Pagination
                  page={list.data.page}
                  totalPages={list.data.totalPages}
                  total={list.data.total}
                  pageSize={list.data.pageSize}
                  onPageChange={list.setPage}
                />
              )}
            </>
          )}
        </Card>
      )}

      {/* Quick preview */}
      <Dialog open={Boolean(previewDoc)} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="border-b border-border">
            <DialogTitle className="truncate">{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <DocumentPreview
              document={previewDoc}
              className="h-[60vh] rounded-none border-0"
              onDownload={() => handleDownload(previewDoc)}
            />
          )}
        </DialogContent>
      </Dialog>

      <RenameDialog
        open={Boolean(renameDoc)}
        onOpenChange={() => setRenameDoc(null)}
        currentName={renameDoc?.name ?? ""}
        onRename={handleRename}
      />

      <MoveDialog
        open={Boolean(moveTargets)}
        onOpenChange={() => setMoveTargets(null)}
        categories={categories.data ?? []}
        count={moveTargets?.length ?? 0}
        onMove={handleMove}
      />

      <ConfirmDialog
        open={Boolean(deleteTargets)}
        onOpenChange={() => setDeleteTargets(null)}
        title={
          deleteTargets?.length === 1 ? "Ștergi acest document?" : "Ștergi aceste documente?"
        }
        description="Fișierul original, metadatele extrase și indexarea semantică vor fi eliminate. Acțiunea nu poate fi anulată."
        confirmLabel="Șterge"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
