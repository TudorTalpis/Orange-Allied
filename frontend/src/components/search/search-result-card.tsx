import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import { DocumentStatusBadge } from "@/components/common/status-badge";
import type { SearchResult } from "@/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

function relevanceTone(score: number) {
  if (score >= 0.85) return "text-success";
  if (score >= 0.7) return "text-warning";
  return "text-muted-foreground";
}

export function SearchResultCard({ result }: { result: SearchResult }) {
  const { document: doc } = result;

  return (
    <Card interactive className="p-4">
      <div className="flex gap-3">
        <FileTypeIcon type={doc.type} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link
              to={`/documents/${doc.id}`}
              className="min-w-0 text-[14px] font-medium underline-offset-4 hover:underline"
            >
              {doc.name}
            </Link>
            <span className="flex shrink-0 items-center gap-1.5">
              <span
                className={cn(
                  "font-mono text-[12px] tabular-nums",
                  relevanceTone(result.score),
                )}
              >
                {Math.round(result.score * 100)}%
              </span>
              <span className="text-[11px] text-subtle-foreground">relevanță</span>
            </span>
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
            <span>{doc.metadata?.company ?? "Neclasificat"}</span>
            {doc.metadata?.amount !== undefined && (
              <>
                <span aria-hidden>·</span>
                <span className="font-mono tabular-nums text-foreground">
                  {formatCurrency(doc.metadata.amount, doc.metadata.currency)}
                </span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="tabular-nums">
              {formatDate(doc.metadata?.date ?? doc.uploadedAt)}
            </span>
            {result.page !== undefined && (
              <>
                <span aria-hidden>·</span>
                <span className="font-mono">pagina {result.page}</span>
              </>
            )}
          </p>

          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {result.snippet}
          </p>

          {result.matches.length > 0 && (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {result.matches.map((match) => (
                <li key={`${match.field}-${match.snippet}`}>
                  <Badge variant="neutral">
                    <span className="text-subtle-foreground">{match.field}:</span>
                    <span className="max-w-40 truncate">{match.snippet}</span>
                  </Badge>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <DocumentStatusBadge status={doc.status} />
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/documents/${doc.id}`}>
                Deschide documentul
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
