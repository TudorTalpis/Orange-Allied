import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Gauge, RefreshCw, TriangleAlert, Workflow } from "lucide-react";
import { processingApi } from "@/api";
import { useAsync } from "@/hooks/useAsync";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { JobCard } from "@/components/processing/job-card";
import type { ProcessingJob } from "@/types";
import { cn } from "@/lib/utils";

const statTiles = [
  { key: "activeJobs", label: "Sarcini active", icon: Workflow, tone: "primary" },
  { key: "queuedJobs", label: "În așteptare", icon: Clock, tone: "default" },
  { key: "completedToday", label: "Finalizate azi", icon: CheckCircle2, tone: "success" },
  { key: "failedToday", label: "Eșuate azi", icon: TriangleAlert, tone: "danger" },
] as const;

const toneStyles = {
  primary: "border-primary-border bg-primary-subtle text-brand-bright",
  default: "border-border bg-surface-raised text-muted-foreground",
  success: "border-success-border bg-success-muted text-success",
  danger: "border-danger-border bg-danger-muted text-danger",
};

export default function ProcessingPage() {
  const jobs = useAsync(() => processingApi.listJobs(), []);
  const stats = useAsync(() => processingApi.stats(), []);
  const [busyJobId, setBusyJobId] = useState<string | null>(null);

  async function handleRetry(job: ProcessingJob) {
    setBusyJobId(job.id);
    try {
      await processingApi.retry(job.id);
      toast.success("Sarcina a fost repornită", {
        description: `${job.documentName} reintră în flux la etapa OCR.`,
      });
      jobs.reload();
      stats.reload();
    } catch (cause) {
      toast.error("Sarcina nu a putut fi repornită", {
        description: cause instanceof Error ? cause.message : undefined,
      });
    } finally {
      setBusyJobId(null);
    }
  }

  async function handleCancel(job: ProcessingJob) {
    await processingApi.cancel(job.id);
    toast.success("Sarcina a fost anulată");
    jobs.reload();
    stats.reload();
  }

  const all = jobs.data ?? [];
  const active = all.filter(
    (job) => job.status === "running" || job.status === "queued",
  );
  const failed = all.filter((job) => job.status === "failed");
  const history = all.filter(
    (job) => job.status === "completed" || job.status === "cancelled",
  );

  function renderList(list: ProcessingJob[], emptyTitle: string, emptyBody: string) {
    if (jobs.loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-card" />
          ))}
        </div>
      );
    }
    if (list.length === 0) {
      return <EmptyState icon={Workflow} title={emptyTitle} description={emptyBody} />;
    }
    return (
      <div className="space-y-3">
        {list.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onRetry={handleRetry}
            onCancel={handleCancel}
            busy={busyJobId === job.id}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Procesare"
        description="Monitorizează sarcinile OCR, clasificare și extragere AI."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              jobs.reload();
              stats.reload();
            }}
          >
            <RefreshCw />
            Actualizează
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.loading &&
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-card" />
          ))}

        {stats.data && (
          <>
            {statTiles.map((tile) => (
              <Card key={tile.key} className="p-4">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg border",
                    toneStyles[tile.tone],
                  )}
                  aria-hidden
                >
                  <tile.icon className="size-3.5" />
                </span>
                <p className="mt-3 text-[12px] text-muted-foreground">{tile.label}</p>
                <p className="text-xl font-semibold tabular-nums">
                  {stats.data![tile.key]}
                </p>
              </Card>
            ))}
            <Card className="p-4">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg border",
                  toneStyles.default,
                )}
                aria-hidden
              >
                <Gauge className="size-3.5" />
              </span>
              <p className="mt-3 text-[12px] text-muted-foreground">
                Durată medie
              </p>
              <p className="text-xl font-semibold tabular-nums">
                {(stats.data.averageDurationMs / 1000).toFixed(1)}s
              </p>
              <p className="mt-1 text-[11px] text-subtle-foreground">
                rată de reușită {Math.round(stats.data.successRate * 100)}%
              </p>
            </Card>
          </>
        )}
      </div>

      {jobs.error ? (
        <ErrorState
          title="Sarcinile nu au putut fi încărcate"
          message={jobs.error}
          onRetry={jobs.reload}
        />
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active
              {active.length > 0 && (
                <span className="font-mono text-[11px] tabular-nums text-subtle-foreground">
                  {active.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="failed">
              Eșuate
              {failed.length > 0 && (
                <span className="font-mono text-[11px] tabular-nums text-danger">
                  {failed.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Istoric</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {renderList(
              active,
              "Nimic nu se procesează",
              "Sarcinile apar aici cât timp documentele trec prin OCR, clasificare, extragere, validare și indexare.",
            )}
          </TabsContent>
          <TabsContent value="failed">
            {renderList(
              failed,
              "Nu există sarcini eșuate",
              "Aici sunt afișate erorile, etapa care a eșuat și opțiunea de reîncercare.",
            )}
          </TabsContent>
          <TabsContent value="history">
            {renderList(
              history,
              "Nu există sarcini finalizate încă",
              "Sarcinile finalizate sau anulate sunt păstrate aici pentru audit.",
            )}
          </TabsContent>
        </Tabs>
      )}

      <Card>
        <CardContent className="pt-5">
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Notă despre prototip.</span>{" "}
            Progresul afișat aici vine din stratul de servicii simulate. Odată
            ce backendul FastAPI există, această pagină va citi{" "}
            <code className="font-mono text-[11px] text-foreground">GET /processing</code>{" "}
            și va relua sarcinile prin{" "}
            <code className="font-mono text-[11px] text-foreground">
              POST /processing/:id/retry
            </code>
            , cu actualizări în timp real prin websocket sau polling.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
