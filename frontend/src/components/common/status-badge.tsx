import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleX,
  Loader2,
} from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { DocumentStatus, ProcessingJobStatus } from "@/types";
import { cn } from "@/lib/utils";

const documentStatusMap: Record<
  DocumentStatus,
  { label: string; variant: BadgeProps["variant"]; icon: typeof CircleCheck; spin?: boolean }
> = {
  queued: { label: "În așteptare", variant: "neutral", icon: CircleDashed },
  processing: { label: "Se procesează", variant: "warning", icon: Loader2, spin: true },
  processed: { label: "Procesat", variant: "success", icon: CircleCheck },
  needs_review: { label: "Necesită verificare", variant: "info", icon: CircleAlert },
  failed: { label: "Eșuat", variant: "danger", icon: CircleX },
};

export function DocumentStatusBadge({
  status,
  className,
}: {
  status: DocumentStatus;
  className?: string;
}) {
  const { label, variant, icon: Icon, spin } = documentStatusMap[status];
  return (
    <Badge variant={variant} className={className}>
      <Icon className={cn("size-3", spin && "animate-spin")} aria-hidden />
      {label}
    </Badge>
  );
}

const jobStatusMap: Record<
  ProcessingJobStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  queued: { label: "În așteptare", variant: "neutral" },
  running: { label: "În desfășurare", variant: "warning" },
  completed: { label: "Finalizat", variant: "success" },
  failed: { label: "Eșuat", variant: "danger" },
  cancelled: { label: "Anulat", variant: "outline" },
};

export function JobStatusBadge({
  status,
  className,
}: {
  status: ProcessingJobStatus;
  className?: string;
}) {
  const { label, variant } = jobStatusMap[status];
  return (
    <Badge variant={variant} className={className}>
      {status === "running" && (
        <span className="size-1.5 animate-pulse-soft rounded-full bg-warning" aria-hidden />
      )}
      {label}
    </Badge>
  );
}
