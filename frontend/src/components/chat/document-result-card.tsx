import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import type { Document } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

/** A document rendered inside an assistant answer. */
export function DocumentResultCard({
  document: doc,
  index,
  reason,
}: {
  document: Document;
  index: number;
  reason?: string;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-border-strong hover:bg-surface-raised">
      <span
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised font-mono text-[10px] text-muted-foreground"
        aria-hidden
      >
        {index}
      </span>
      <FileTypeIcon type={doc.type} size="sm" />

      <div className="min-w-0 flex-1">
        <Link
          to={`/documents/${doc.id}`}
          className="block truncate text-[13px] font-medium underline-offset-4 hover:underline"
        >
          {doc.name}
        </Link>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted-foreground">
          <span>{doc.metadata?.company ?? "Neclasificat"}</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">
            {formatDate(doc.metadata?.date ?? doc.uploadedAt)}
          </span>
        </p>
        {reason && (
          <p className="mt-1 text-[12px] text-subtle-foreground">{reason}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {doc.metadata?.amount !== undefined && (
          <span className="font-mono text-[13px] tabular-nums">
            {formatCurrency(doc.metadata.amount, doc.metadata.currency)}
          </span>
        )}
        <Link
          to={`/documents/${doc.id}`}
          className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Deschide
          <ArrowUpRight className="size-3" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
