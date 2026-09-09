import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CircleDashed,
  CircleX,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingRows } from "@/components/common/loading-state";
import { InlineError } from "@/components/common/error-state";
import type { ProcessingJob, ProcessingStage } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const visibleStageLabels: Partial<Record<ProcessingStage["id"], string>> = {
  ocr: "OCR",
  classification: "Clasificare",
  extraction: "Extragere",
  embeddings: "Index de căutare",
};

export function ProcessingActivity({
  jobs,
  loading,
  error,
  onRetry,
}: {
  jobs: ProcessingJob[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>Activitate de procesare</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild className="shrink-0">
          <Link to="/processing">
            Deschide
            <ArrowRight />
          </Link>
        </Button>
      </CardHeader>

      {loading && <LoadingRows rows={4} />}

      {!loading && error && (
        <div className="px-5 pb-5">
          <InlineError message={error} onRetry={onRetry} />
        </div>
      )}

      {!loading && !error && jobs && (
        <ol className="flex-1 space-y-0 border-t border-border">
          {prioritisedJobs(jobs).slice(0, 3).map((job) => {
            const currentStage = job.stages.find((stage) => stage.status === "active" || stage.status === "failed");
            return (
              <li key={job.id} className="px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/documents/${job.documentId}`} className="min-w-0 truncate text-[13px] font-medium underline-offset-4 hover:underline">{job.documentName}</Link>
                    <span className={cn("shrink-0 font-mono text-[11px] tabular-nums", job.status === "failed" ? "text-danger" : job.status === "running" ? "text-warning" : "text-success")}>{job.status === "completed" ? "Gata" : job.status === "queued" ? "În așteptare" : `${job.progress}%`}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {job.stages.filter((stage) => stage.id in visibleStageLabels).map((stage) => <PipelineStage key={stage.id} stage={stage} />)}
                  </div>
                  <p className="mt-2 text-[11px] text-subtle-foreground">
                    {currentStage ? `${currentStage.label}${currentStage.progress ? ` · ${currentStage.progress}%` : ""}` : "Disponibil pentru căutare"} · {formatRelativeTime(job.finishedAt ?? job.startedAt ?? job.queuedAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

function prioritisedJobs(jobs: ProcessingJob[]) {
  const rank = { running: 0, queued: 1, failed: 2, completed: 3, cancelled: 4 };
  return [...jobs].sort((a, b) => rank[a.status] - rank[b.status]);
}

function PipelineStage({ stage }: { stage: ProcessingStage }) {
  const label = visibleStageLabels[stage.id];
  const state = stage.status;
  const Icon = state === "completed" ? Check : state === "failed" ? CircleX : state === "active" ? Loader2 : CircleDashed;
  return (
    <div className={cn("min-w-0 border-l pl-1.5 text-[10px]", state === "completed" ? "border-success text-success" : state === "failed" ? "border-danger text-danger" : state === "active" ? "border-warning text-warning" : "border-border text-subtle-foreground")}>
      <span className="flex items-center gap-1 truncate"><Icon className={cn("size-2.5 shrink-0", state === "active" && "animate-spin")} aria-hidden />{label}</span>
    </div>
  );
}
