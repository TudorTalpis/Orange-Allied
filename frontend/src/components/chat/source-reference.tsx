import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Hint } from "@/components/ui/tooltip";
import type { ChatSource } from "@/types";

export function SourceReference({ source }: { source: ChatSource }) {
  return (
    <Hint label={source.snippet}>
      <Link
        to={`/documents/${source.documentId}`}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] transition-colors hover:border-primary-border hover:bg-primary-subtle"
      >
        <FileText className="size-3 shrink-0 text-subtle-foreground" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{source.documentName}</span>
        {source.page !== undefined && (
          <span className="font-mono text-[10px] text-subtle-foreground">
            p.{source.page}
          </span>
        )}
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {Math.round(source.score * 100)}%
        </span>
      </Link>
    </Hint>
  );
}
