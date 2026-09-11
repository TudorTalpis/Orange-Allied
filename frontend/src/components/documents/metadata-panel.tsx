import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "@/components/common/confidence-meter";
import { EmptyState } from "@/components/common/empty-state";
import { FileSearch } from "lucide-react";
import type { ExtractedField } from "@/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

function renderValue(field: ExtractedField): React.ReactNode {
  if (field.value === null || field.value === undefined) return "—";

  switch (field.type) {
    case "currency":
      return (
        <span className="font-mono tabular-nums">
          {formatCurrency(Number(field.value), field.currency)}
        </span>
      );
    case "date":
      return <span className="tabular-nums">{formatDate(String(field.value), "long")}</span>;
    case "number":
      return (
        <span className="font-mono tabular-nums">
          {Number(field.value).toLocaleString()}
        </span>
      );
    case "boolean":
      return (
        <Badge variant={field.value ? "success" : "neutral"}>
          {field.value ? "Da" : "Nu"}
        </Badge>
      );
    case "list":
      return (
        <ul className="space-y-0.5 text-right">
          {(field.value as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    default:
      return String(field.value);
  }
}

/**
 * Renders whatever fields the extraction stage produced. It is deliberately
 * class-agnostic: invoices, contracts and identity documents all render here.
 */
export function MetadataPanel({
  fields,
  className,
}: {
  fields: ExtractedField[] | undefined;
  className?: string;
}) {
  if (!fields || fields.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title="Nu există câmpuri extrase încă"
        description="Valorile extrase apar aici după ce documentul trece de etapele de extragere și validare."
        className={className}
      />
    );
  }

  return (
    <dl className={cn("divide-y divide-border", className)}>
      {fields.map((field) => (
        <div
          key={field.key}
          className={cn(
            "flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
            field.needsReview && "-mx-3 rounded-lg bg-warning-muted/40 px-3",
          )}
        >
          <dt className="flex min-w-0 items-center gap-1.5 text-[12px] text-muted-foreground">
            {field.label}
            {field.needsReview && (
              <CircleAlert className="size-3 shrink-0 text-warning" aria-label="Necesită verificare" />
            )}
            {field.page !== undefined && (
              <span className="font-mono text-[10px] text-subtle-foreground">
                p.{field.page}
              </span>
            )}
          </dt>
          <dd className="flex items-center gap-3 text-[13px] sm:justify-end sm:text-right">
            <span className="min-w-0">{renderValue(field)}</span>
            <ConfidenceMeter value={field.confidence} showLabel={false} className="shrink-0" />
          </dd>
        </div>
      ))}
    </dl>
  );
}
