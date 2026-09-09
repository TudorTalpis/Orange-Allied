import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CircleDashed,
  CircleX,
  Clock,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import type { DocumentFileType, ProcessingStage } from "@/types";
import { cn, formatBytes } from "@/lib/utils";

export type QueueStatus =
  | "waiting"
  | "uploading"
  | "processing"
  | "processed"
  | "failed"
  | "rejected";

export interface QueueItem {
  id: string;
  file: File;
  status: QueueStatus;
  progress: number;
  error?: string;
  documentId?: string;
  /** Live pipeline state, mirrored from the processing service. */
  stages?: ProcessingStage[];
  /** What the classifier decided, once it has decided. */
  detectedType?: string;
}

const statusMeta: Record<
  QueueStatus,
  { label: string; icon: typeof Clock; className: string; spin?: boolean }
> = {
  waiting: { label: "În așteptare", icon: Clock, className: "text-subtle-foreground" },
  uploading: { label: "Se încarcă", icon: Loader2, className: "text-info", spin: true },
  processing: { label: "Se procesează", icon: Loader2, className: "text-warning", spin: true },
  processed: { label: "Procesat", icon: Check, className: "text-success" },
  failed: { label: "Eșuat", icon: CircleX, className: "text-danger" },
  rejected: { label: "Respins", icon: CircleX, className: "text-danger" },
};

function fileType(file: File): DocumentFileType {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx")) return "docx";
  return "image";
}

/** One pipeline stage as a compact row: state, name, and what it produced. */
function StageRow({ stage }: { stage: ProcessingStage }) {
  const Icon =
    stage.status === "completed"
      ? Check
      : stage.status === "failed"
        ? CircleX
        : stage.status === "active"
          ? Loader2
          : CircleDashed;

  return (
    <li className="flex items-center gap-2 text-[11.5px]">
      <Icon
        className={cn(
          "size-3 shrink-0",
          stage.status === "completed" && "text-success",
          stage.status === "failed" && "text-danger",
          stage.status === "active" && "animate-spin text-warning",
          stage.status === "pending" && "text-subtle-foreground",
        )}
        aria-hidden
      />
      <span
        className={cn(
          stage.status === "pending" ? "text-subtle-foreground" : "text-foreground",
        )}
      >
        {stage.label}
      </span>
      {stage.detail && (
        <span className="truncate text-subtle-foreground">· {stage.detail}</span>
      )}
      {stage.status === "active" && stage.progress !== undefined && (
        <span className="ml-auto font-mono tabular-nums text-subtle-foreground">
          {stage.progress}%
        </span>
      )}
    </li>
  );
}

export function UploadQueueItem({
  item,
  onRemove,
  onRetry,
}: {
  item: QueueItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const meta = statusMeta[item.status];
  const Icon = meta.icon;
  const showStages =
    (item.status === "processing" || item.status === "processed" || item.status === "failed") &&
    Boolean(item.stages?.length);

  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <FileTypeIcon type={fileType(item.file)} size="sm" className="mt-0.5" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{item.file.name}</p>
            <p className="mt-0.5 text-[11px] text-subtle-foreground">
              {fileType(item.file).toUpperCase()} · {formatBytes(item.file.size)}
              {item.detectedType && (
                <>
                  {" · "}
                  <span className="text-muted-foreground">{item.detectedType}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span className={cn("flex items-center gap-1.5 text-[11px]", meta.className)}>
              <Icon className={cn("size-3", meta.spin && "animate-spin")} aria-hidden />
              {meta.label}
            </span>
            {(item.status === "failed" || item.status === "rejected") && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRetry(item.id)}
                aria-label={`Reîncearcă ${item.file.name}`}
                disabled={item.status === "rejected"}
              >
                <RefreshCw />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemove(item.id)}
              aria-label={`Elimină ${item.file.name} din coadă`}
            >
              <X />
            </Button>
          </div>
        </div>

        {item.status === "uploading" && (
          <Progress value={item.progress} className="mt-2" />
        )}

        {showStages && (
          <ul className="mt-2.5 space-y-1.5 border-l border-border pl-3">
            {item.stages?.map((stage) => (
              <StageRow key={stage.id} stage={stage} />
            ))}
          </ul>
        )}

        {item.error && (
          <p className="mt-2 text-[11.5px] leading-relaxed text-danger">{item.error}</p>
        )}

        {/* The whole point of the flow: processing must lead somewhere. */}
        {item.status === "processed" && item.documentId && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" asChild>
              <Link to={`/documents/${item.documentId}`}>
                Vezi documentul
                <ArrowRight />
              </Link>
            </Button>
            <Badge variant="success">Disponibil pentru căutare</Badge>
          </div>
        )}
      </div>
    </li>
  );
}

export function UploadSummary({ items }: { items: QueueItem[] }) {
  const counts = {
    total: items.length,
    processed: items.filter((item) => item.status === "processed").length,
    active: items.filter(
      (item) => item.status === "uploading" || item.status === "processing",
    ).length,
    failed: items.filter(
      (item) => item.status === "failed" || item.status === "rejected",
    ).length,
  };

  const done = counts.processed + counts.failed;
  const percent = counts.total === 0 ? 0 : Math.round((done / counts.total) * 100);

  return (
    <div className="space-y-3 border-b border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px]">
          <span className="font-medium tabular-nums">{counts.processed}</span> din{" "}
          <span className="tabular-nums">{counts.total}</span> documente procesate
        </p>
        <div className="flex items-center gap-1.5">
          {counts.active > 0 && <Badge variant="warning">{counts.active} în lucru</Badge>}
          <Badge variant="success">{counts.processed} reușite</Badge>
          {counts.failed > 0 && <Badge variant="danger">{counts.failed} eșuate</Badge>}
        </div>
      </div>
      <Progress
        value={percent}
        tone={counts.failed > 0 ? "warning" : "success"}
        aria-label="Progres general"
      />
    </div>
  );
}
