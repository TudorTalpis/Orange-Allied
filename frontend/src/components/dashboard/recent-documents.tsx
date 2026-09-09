import { Link } from "react-router-dom";
import { ArrowRight, Building2, Clock3 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import { DocumentStatusBadge } from "@/components/common/status-badge";
import { LoadingRows } from "@/components/common/loading-state";
import { InlineError } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Files } from "lucide-react";
import type { Document } from "@/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface RecentDocumentsProps {
  documents: Document[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function RecentDocuments({
  documents,
  loading,
  error,
  onRetry,
}: RecentDocumentsProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>Documente recente</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild className="shrink-0">
          <Link to="/documents">
            Vezi toate
            <ArrowRight />
          </Link>
        </Button>
      </CardHeader>

      {loading && <LoadingRows rows={5} />}

      {!loading && error && (
        <div className="px-5 pb-5">
          <InlineError message={error} onRetry={onRetry} />
        </div>
      )}

      {!loading && !error && documents?.length === 0 && (
        <div className="px-5 pb-5">
          <EmptyState
            icon={Files}
            title="Nu există documente încă"
            description="Încarcă primul document pentru a-l vedea aici."
            action={
              <Button variant="primary" size="sm" asChild>
                <Link to="/upload">Încarcă document</Link>
              </Button>
            }
          />
        </div>
      )}

      {!loading && !error && documents && documents.length > 0 && (
        <>
          <div className="hidden grid-cols-[minmax(0,1fr)_7rem_7rem_5rem] gap-3 border-t border-border px-5 py-2 text-[10px] font-medium uppercase tracking-[0.11em] text-subtle-foreground sm:grid">
            <span>Document</span>
            <span>Tip</span>
            <span>Stare</span>
            <span className="text-right">Actualizat</span>
          </div>
          <ul className="divide-y divide-border border-t border-border sm:border-t-0">
            {documents.map((doc) => (
              <li key={doc.id} className="transition-colors hover:bg-surface-raised">
                <Link
                  to={`/documents/${doc.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 sm:grid sm:grid-cols-[minmax(0,1fr)_7rem_7rem_5rem] sm:gap-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <FileTypeIcon type={doc.type} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">{doc.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-muted-foreground">
                        {doc.metadata?.company && <><Building2 className="size-3 shrink-0" aria-hidden /><span className="truncate">{doc.metadata.company}</span></>}
                        {doc.metadata?.company && doc.metadata?.amount !== undefined && <span aria-hidden>·</span>}
                        {doc.metadata?.amount !== undefined && <span className="font-mono tabular-nums">{formatCurrency(doc.metadata.amount, doc.metadata.currency)}</span>}
                        {!doc.metadata?.company && doc.metadata?.amount === undefined && <span>Se așteaptă detaliile extrase</span>}
                      </p>
                    </div>
                  </div>
                  <span className="hidden truncate text-[12px] text-muted-foreground sm:block">{documentTypeLabel(doc.documentType)}</span>
                  <div className="hidden sm:block">
                    <DocumentStatusBadge status={doc.status} />
                  </div>
                  <p className="hidden text-right text-[11px] text-subtle-foreground sm:flex sm:items-center sm:justify-end sm:gap-1"><Clock3 className="size-3" aria-hidden />{formatRelativeTime(doc.uploadedAt)}</p>
                  <div className="sm:hidden"><DocumentStatusBadge status={doc.status} /></div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function documentTypeLabel(type: Document["documentType"]) {
  const labels: Record<NonNullable<Document["documentType"]>, string> = {
    invoice: "Factură", contract: "Contract", receipt: "Chitanță", tax_document: "Document fiscal",
    insurance_policy: "Poliță de asigurare", employment_contract: "Contract de muncă",
    bank_statement: "Extras de cont", identity_document: "Act de identitate", report: "Raport", other: "Altele",
  };
  return type ? labels[type] : "Neclasificat";
}
