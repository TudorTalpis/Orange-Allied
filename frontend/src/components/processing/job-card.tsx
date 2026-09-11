import { Link } from "react-router-dom";
import { ExternalLink, RefreshCw, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JobStatusBadge } from "@/components/common/status-badge";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import { InlineError } from "@/components/common/error-state";
import type { ProcessingJob } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { ProcessingPipeline } from "./processing-pipeline";

export function JobCard({
  job,
  onRetry,
  onCancel,
  busy,
}: {
  job: ProcessingJob;
  onRetry?: (job: ProcessingJob) => void;
  onCancel?: (job: ProcessingJob) => void;
  busy?: boolean;
}) {
  const tone =
    job.status === "failed" ? "danger" : job.status === "completed" ? "success" : "primary";

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start gap-3">
        <FileTypeIcon type={job.documentType} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/documents/${job.documentId}`}
              className="truncate text-[13px] font-medium underline-offset-4 hover:underline"
            >
              {job.documentName}
            </Link>
            <JobStatusBadge status={job.status} />
            {job.attempts > 1 && (
              <span className="font-mono text-[11px] text-subtle-foreground">
                încercarea {job.attempts}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-subtle-foreground">
            În așteptare {formatRelativeTime(job.queuedAt)}
            {job.finishedAt && ` · finalizat ${formatRelativeTime(job.finishedAt)}`}
            {job.durationMs && ` · a durat ${(job.durationMs / 1000).toFixed(1)} s`}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {job.status === "failed" && onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRetry(job)}
              loading={busy}
            >
              <RefreshCw />
              Reîncearcă
            </Button>
          )}
          {(job.status === "running" || job.status === "queued") && onCancel && (
            <Button variant="ghost" size="sm" onClick={() => onCancel(job)}>
              <XCircle />
              Anulează
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" asChild aria-label="Deschide documentul">
            <Link to={`/documents/${job.documentId}`}>
              <ExternalLink />
            </Link>
          </Button>
        </div>
      </div>

      {(job.status === "running" || job.status === "queued") && (
        <div className="mt-3 flex items-center gap-3">
          <Progress value={job.progress} tone={tone} className="flex-1" />
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {job.progress}%
          </span>
        </div>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <ProcessingPipeline stages={job.stages} />
      </div>

      {job.error && (
        <InlineError
          message={job.error}
          onRetry={onRetry ? () => onRetry(job) : undefined}
          className="mt-3"
        />
      )}
    </Card>
  );
}
