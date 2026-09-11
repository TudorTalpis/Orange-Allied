import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "A apărut o problemă",
  message,
  onRetry,
  retryLabel = "Încearcă din nou",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-danger-border bg-danger-muted/40 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-xl border border-danger-border bg-danger-muted">
        <TriangleAlert className="size-5 text-danger" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        <p className="mx-auto max-w-md text-[13px] leading-relaxed text-muted-foreground">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/** Inline variant used inside cards and panels. */
export function InlineError({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-danger-border bg-danger-muted/50 px-3 py-2.5 text-[13px]",
        className,
      )}
    >
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-danger" aria-hidden />
      <span className="flex-1 text-muted-foreground">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 font-medium text-danger underline-offset-2 hover:underline"
        >
          Încearcă din nou
        </button>
      )}
    </div>
  );
}
