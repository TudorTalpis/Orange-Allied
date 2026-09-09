import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bot,
  Download,
  FileQuestion,
  FolderInput,
  Pencil,
  Copy,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { categoriesApi, documentsApi } from "@/api";
import { useAsync } from "@/hooks/useAsync";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { DocumentStatusBadge } from "@/components/common/status-badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DocumentPreview } from "@/components/documents/document-preview";
import { MetadataPanel } from "@/components/documents/metadata-panel";
import { RenameDialog } from "@/components/documents/rename-dialog";
import { MoveDialog } from "@/components/documents/move-dialog";
import { ProcessingPipeline } from "@/components/processing/processing-pipeline";
import { buildStages } from "@/data/mockProcessing";
import type { Document } from "@/types";
import { formatBytes, formatDate, formatRelativeTime } from "@/lib/utils";

const documentTypeLabels: Record<string, string> = {
  invoice: "Factură",
  contract: "Contract",
  receipt: "Chitanță",
  tax_document: "Document fiscal",
  insurance_policy: "Poliță de asigurare",
  employment_contract: "Contract de muncă",
  bank_statement: "Extras de cont",
  identity_document: "Act de identitate",
  report: "Raport",
  other: "Altele",
};

/** Reconstructs the stage view from a document's status. */
/**
 * Prefer the stages the pipeline actually recorded on the document; fall back to
 * reconstructing them from the status for the seeded fixtures, which predate the
 * pipeline having been run.
 */
function stagesFor(doc: Document) {
  if (doc.processingStages?.length) return doc.processingStages;

  switch (doc.status) {
    case "processed":
      return buildStages(6);
    case "needs_review":
      return buildStages(4, "completed");
    case "processing":
      return buildStages(3, "active", 62);
    case "failed":
      return buildStages(1, "failed");
    default:
      return buildStages(0, "pending");
  }
}

export default function DocumentDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const request = useAsync(() => documentsApi.get(id), [id]);
  const categories = useAsync(() => categoriesApi.list(), []);

  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  const doc = request.data;

  if (request.loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Skeleton className="h-[32rem] rounded-card" />
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-card" />
            <Skeleton className="h-64 rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  if (request.error || !doc) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/documents">
            <ArrowLeft />
            Înapoi la documente
          </Link>
        </Button>
        <ErrorState
          title="Documentul nu a putut fi deschis"
          message={request.error ?? "Documentul nu mai există."}
          onRetry={request.reload}
        />
      </div>
    );
  }

  const category = categories.data?.find((item) => item.id === doc.categoryId);

  function notifyDownload() {
    toast.info("Descărcarea va fi disponibilă odată cu backendul", {
      description: "Fișierul propriu-zis nu este stocat în acest prototip.",
    });
  }

  async function handleReprocess() {
    setReprocessing(true);
    try {
      await documentsApi.reprocess(doc!.id);
      toast.success("Procesarea a fost repusă în coadă");
      request.reload();
    } finally {
      setReprocessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Header */}
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/documents">
            <ArrowLeft />
            Documente
          </Link>
        </Button>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="break-all text-xl font-semibold tracking-tight sm:text-2xl">
              {doc.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <DocumentStatusBadge status={doc.status} />
              {doc.documentType && (
                <Badge variant="primary">
                  {documentTypeLabels[doc.documentType] ?? doc.documentType}
                </Badge>
              )}
              {category && (
                <Badge variant="outline">
                  <span
                    className="size-2 rounded-[3px]"
                    style={{ backgroundColor: category.color }}
                    aria-hidden
                  />
                  {category.name}
                </Badge>
              )}
              <span className="text-[12px] text-subtle-foreground">
                {formatBytes(doc.size)} · {doc.pageCount ?? 1}{" "}
                {(doc.pageCount ?? 1) === 1 ? "pagină" : "pagini"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={notifyDownload}>
              <Download />
              Descarcă
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setRenameOpen(true)}>
              <Pencil />
              Redenumește
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setMoveOpen(true)}>
              <FolderInput />
              Mută
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReprocess}
              loading={reprocessing}
            >
              <RefreshCw />
              Reprocesează
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 />
              Șterge
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Preview */}
        <DocumentPreview
          document={doc}
          className="h-[30rem] lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)]"
          onDownload={notifyDownload}
        />

        {/* Information */}
        <div className="space-y-5">
          {doc.aiSummary ? (
            <Card className="relative overflow-hidden border-primary-border">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-primary/18 blur-3xl"
              />
              <CardHeader className="relative flex-row items-center gap-2 space-y-0">
                <span className="flex size-6 items-center justify-center rounded-md brand-gradient">
                  <Sparkles className="size-3 text-primary-foreground" aria-hidden />
                </span>
                <CardTitle>Rezumat AI</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {doc.aiSummary}
                </p>
                <Button variant="ghost" size="sm" asChild className="mt-3 -ml-2">
                  <Link
                    to={`/chat?q=${encodeURIComponent(`Spune-mi mai multe despre ${doc.name}`)}`}
                  >
                    <Bot />
                    Întreabă despre acest document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-5">
                <EmptyState
                  icon={FileQuestion}
                  title="Încă nu există rezumat"
                  description="Rezumatul este generat după ce documentul trece de extragere și validare."
                  className="border-0 py-6"
                />
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden">
            <Tabs defaultValue="fields">
              <div className="border-b border-border px-4 pt-4">
                <TabsList className="border-0 bg-transparent p-0">
                  <TabsTrigger value="fields">Câmpuri extrase</TabsTrigger>
                  <TabsTrigger value="text">Text extras</TabsTrigger>
                  <TabsTrigger value="processing">Procesare</TabsTrigger>
                  <TabsTrigger value="activity">Activitate</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="fields" className="mt-0 p-4">
                <MetadataPanel fields={doc.metadata?.fields} />
              </TabsContent>

              <TabsContent value="text" className="mt-0 p-4">
                {doc.extractedText ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] text-muted-foreground">
                        Textul recunoscut de etapa OCR, așa cum a fost citit din
                        document.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          void navigator.clipboard
                            .writeText(doc.extractedText ?? "")
                            .then(() => toast.success("Text copiat"))
                            .catch(() => toast.error("Textul nu a putut fi copiat"));
                        }}
                      >
                        <Copy />
                        Copiază
                      </Button>
                    </div>
                    <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-canvas p-4 font-mono text-[12px] leading-relaxed text-muted-foreground">
                      {doc.extractedText}
                    </pre>
                  </div>
                ) : (
                  <EmptyState
                    icon={FileQuestion}
                    title="Niciun text extras"
                    description="Textul apare aici după ce documentul trece de etapa OCR."
                    className="border-0 py-6"
                  />
                )}
              </TabsContent>

              <TabsContent value="processing" className="mt-0 space-y-5 p-4">
                <ProcessingPipeline stages={stagesFor(doc)} orientation="vertical" />

                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised px-3 py-2.5">
                  <span className="text-[12.5px] text-muted-foreground">
                    Stare index semantic
                  </span>
                  {doc.indexingStatus === "indexed" || doc.status === "processed" ? (
                    <Badge variant="success">Disponibil pentru căutare</Badge>
                  ) : doc.indexingStatus === "failed" ? (
                    <Badge variant="danger">Indexare eșuată</Badge>
                  ) : (
                    <Badge variant="neutral">În așteptare</Badge>
                  )}
                </div>

                <dl className="space-y-2 border-t border-border pt-4 text-[13px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Încărcat</dt>
                    <dd className="tabular-nums">{formatDate(doc.uploadedAt, "datetime")}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Procesat</dt>
                    <dd className="tabular-nums">
                      {doc.processedAt ? formatDate(doc.processedAt, "datetime") : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Încărcat de</dt>
                    <dd>{doc.uploadedBy}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Limbă detectată</dt>
                    <dd className="uppercase">{doc.metadata?.language ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Tip MIME</dt>
                    <dd className="font-mono text-[12px]">{doc.mimeType}</dd>
                  </div>
                </dl>

                {doc.failureReason && (
                  <div className="rounded-lg border border-danger-border bg-danger-muted/50 p-3">
                    <p className="text-[12px] font-medium text-danger">
                      Procesare eșuată
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {doc.failureReason}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2.5"
                      onClick={handleReprocess}
                      loading={reprocessing}
                    >
                      <RefreshCw />
                      Reîncearcă procesarea
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-0 p-4">
                {doc.activity && doc.activity.length > 0 ? (
                  <ol className="space-y-0">
                    {doc.activity.map((entry, index) => (
                      <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
                        {index !== doc.activity!.length - 1 && (
                          <span
                            aria-hidden
                            className="absolute left-[0.3125rem] top-4 h-full w-px bg-border"
                          />
                        )}
                        <span
                          aria-hidden
                          className="relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-background bg-border-strong"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium">{entry.action}</p>
                          {entry.detail && (
                            <p className="mt-0.5 text-[12px] text-muted-foreground">
                              {entry.detail}
                            </p>
                          )}
                          <p className="mt-0.5 text-[11px] text-subtle-foreground">
                            {entry.actor} · {formatRelativeTime(entry.timestamp)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="py-6 text-center text-[13px] text-muted-foreground">
                    Nicio activitate înregistrată pentru acest document.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalii document</CardTitle>
              <CardDescription>
                Valori normalizate din etapa de extragere.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border text-[13px]">
                {[
                  ["Număr factură", doc.metadata?.invoiceNumber],
                  ["Companie", doc.metadata?.company],
                  ["Client", doc.metadata?.customer],
                  ["Data documentului", doc.metadata?.date ? formatDate(doc.metadata.date, "long") : undefined],
                  ["Data scadentă", doc.metadata?.dueDate ? formatDate(doc.metadata.dueDate, "long") : undefined],
                  ["Monedă", doc.metadata?.currency],
                  ["Adresă", doc.metadata?.address],
                ]
                  .filter(([, value]) => Boolean(value))
                  .map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-6"
                    >
                      <dt className="text-[12px] text-muted-foreground">{label}</dt>
                      <dd className="sm:max-w-[60%] sm:text-right">{value}</dd>
                    </div>
                  ))}
                {!doc.metadata?.company && !doc.metadata?.invoiceNumber && (
                  <p className="py-3 text-[13px] text-muted-foreground">
                    Încă nu există detalii normalizate — acest document nu a
                    finalizat extragerea.
                  </p>
                )}
              </dl>
            </CardContent>
          </Card>

          {doc.tags && doc.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Etichete</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {doc.tags.map((tag) => (
                  <Badge key={tag} variant="neutral">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentName={doc.name}
        onRename={async (name) => {
          await documentsApi.update(doc.id, { name });
          toast.success("Documentul a fost redenumit");
          request.reload();
        }}
      />

      <MoveDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        categories={categories.data ?? []}
        count={1}
        onMove={async (categoryId) => {
          await documentsApi.update(doc.id, { categoryId });
          toast.success("Documentul a fost mutat");
          request.reload();
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Ștergi acest document?"
        description="Fișierul original, metadatele extrase și indexarea semantică vor fi eliminate. Acțiunea nu poate fi anulată."
        confirmLabel="Șterge"
        destructive
        onConfirm={async () => {
          await documentsApi.remove(doc.id);
          toast.success("Documentul a fost șters");
          navigate("/documents");
        }}
      />
    </div>
  );
}
