import { Link } from "react-router-dom";
import { Search, Upload } from "lucide-react";
import { dashboardApi, documentsApi, processingApi } from "@/api";
import { useAsync } from "@/hooks/useAsync";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { CollectionSummary } from "@/components/dashboard/collection-summary";
import { AttentionPanel } from "@/components/dashboard/attention-panel";
import { CompositionBar } from "@/components/dashboard/composition-bar";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { ProcessingActivity } from "@/components/dashboard/processing-activity";
import { AIPromptCard } from "@/components/dashboard/ai-prompt-card";

function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bună dimineața";
  if (hour < 18) return "Bună ziua";
  return "Bună seara";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const overview = useAsync(() => dashboardApi.overview(), []);
  const recent = useAsync(() => documentsApi.recent(5), []);
  const jobs = useAsync(() => processingApi.listJobs(), []);

  const firstName = user?.fullName.split(" ")[0] ?? "";
  const today = new Date().toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-subtle-foreground">
            {today}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link to="/search">
              <Search />
              Caută
            </Link>
          </Button>
          <Button variant="primary" asChild>
            <Link to="/upload">
              <Upload />
              Încarcă documente
            </Link>
          </Button>
        </div>
      </header>

      {overview.loading && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,1fr)]">
          <Skeleton className="h-72 rounded-card" />
          <Skeleton className="h-72 rounded-card" />
        </div>
      )}

      {overview.error && (
        <ErrorState
          title="Panoul de control nu a putut fi încărcat"
          message={overview.error}
          onRetry={overview.reload}
        />
      )}

      {overview.data && (
        <>
          {/* The focal row: one dominant panel, one panel that asks for action. */}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,1fr)]">
            <CollectionSummary overview={overview.data} />
            <AttentionPanel overview={overview.data} />
          </div>

          {/* A bare section — no card — so the page has more than one texture. */}
          <div className="border-y border-border py-5">
            <CompositionBar slices={overview.data.byCategory} />
          </div>
        </>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,1fr)]">
        <RecentDocuments
          documents={recent.data}
          loading={recent.loading}
          error={recent.error}
          onRetry={recent.reload}
        />
        <ProcessingActivity
          jobs={jobs.data}
          loading={jobs.loading}
          error={jobs.error}
          onRetry={jobs.reload}
        />
      </div>

      <AIPromptCard />
    </div>
  );
}
