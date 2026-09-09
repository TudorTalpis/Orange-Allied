import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import { DocumentStatusBadge } from "@/components/common/status-badge";
import type { Document, DocumentCategory } from "@/types";
import { formatBytes, formatCurrency, formatDate } from "@/lib/utils";
import { DocumentActions, type DocumentActionHandlers } from "./document-actions";

export function DocumentCard({
  document,
  categories,
  selected,
  onToggleSelect,
  handlers,
}: {
  document: Document;
  categories: DocumentCategory[];
  selected: boolean;
  onToggleSelect: (id: string) => void;
  handlers: DocumentActionHandlers;
}) {
  const category = categories.find((item) => item.id === document.categoryId);

  return (
    <Card
      interactive
      data-selected={selected || undefined}
      className="group relative flex flex-col p-4 data-[selected]:border-primary-border data-[selected]:bg-primary-subtle/50"
    >
      <div className="flex items-start justify-between gap-2">
        <FileTypeIcon type={document.type} />
        <div className="flex items-center gap-1">
          <span className="opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 data-[on]:opacity-100" data-on={selected || undefined}>
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect(document.id)}
              aria-label={`Select ${document.name}`}
            />
          </span>
          <DocumentActions document={document} handlers={handlers} />
        </div>
      </div>

      <Link
        to={`/documents/${document.id}`}
        className="mt-3 block underline-offset-4 hover:underline"
      >
        <h3 className="line-clamp-2 text-[13px] font-medium leading-snug">
          {document.name}
        </h3>
      </Link>

      <p className="mt-1 truncate text-[12px] text-muted-foreground">
        {document.metadata?.company ?? "Neclasificat"}
      </p>

      <dl className="mt-3 space-y-1 text-[12px]">
        <div className="flex justify-between gap-2">
          <dt className="text-subtle-foreground">Dată</dt>
          <dd className="tabular-nums text-muted-foreground">
            {formatDate(document.metadata?.date ?? document.uploadedAt)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-subtle-foreground">Sumă</dt>
          <dd className="font-mono tabular-nums">
            {formatCurrency(document.metadata?.amount, document.metadata?.currency)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-subtle-foreground">Dimensiune</dt>
          <dd className="tabular-nums text-muted-foreground">
            {formatBytes(document.size)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <DocumentStatusBadge status={document.status} />
        {category && (
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="size-2 rounded-[3px]"
              style={{ backgroundColor: category.color }}
              aria-hidden
            />
            {category.name}
          </span>
        )}
      </div>
    </Card>
  );
}
