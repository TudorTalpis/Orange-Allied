import { Check, CircleDashed, Loader2, Minus, X } from "lucide-react";
import { pipelineStageDescriptions } from "@/data/mockProcessing";
import type { ProcessingStage, ProcessingStageStatus } from "@/types";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  ProcessingStageStatus,
  { node: string; label: string; connector: string }
> = {
  completed: {
    node: "border-success-border bg-success-muted text-success",
    label: "text-foreground",
    connector: "bg-success/50",
  },
  active: {
    node: "border-primary-border bg-primary-muted text-brand-bright",
    label: "text-foreground",
    connector: "bg-border",
  },
  pending: {
    node: "border-border bg-surface-raised text-subtle-foreground",
    label: "text-subtle-foreground",
    connector: "bg-border",
  },
  failed: {
    node: "border-danger-border bg-danger-muted text-danger",
    label: "text-danger",
    connector: "bg-border",
  },
  skipped: {
    node: "border-border bg-surface-raised text-subtle-foreground",
    label: "text-subtle-foreground",
    connector: "bg-border",
  },
};

const statusIcon: Record<ProcessingStageStatus, typeof Check> = {
  completed: Check,
  active: Loader2,
  pending: CircleDashed,
  failed: X,
  skipped: Minus,
};

const statusText: Record<ProcessingStageStatus, string> = {
  completed: "finalizat",
  active: "în desfășurare",
  pending: "în așteptare",
  failed: "eșuat",
  skipped: "omis",
};

/**
 * The six-stage pipeline. Horizontal on wide screens, a vertical timeline on
 * narrow ones — the same data, laid out for the space available.
 */
export function ProcessingPipeline({
  stages,
  orientation = "responsive",
  className,
}: {
  stages: ProcessingStage[];
  orientation?: "responsive" | "vertical";
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "flex flex-col gap-0",
        orientation === "responsive" && "sm:flex-row sm:items-start sm:gap-0",
        className,
      )}
    >
      {stages.map((stage, index) => {
        const styles = statusStyles[stage.status];
        const Icon = statusIcon[stage.status];
        const last = index === stages.length - 1;

        return (
          <li
            key={stage.id}
            className={cn(
              "relative flex gap-3",
              orientation === "responsive" &&
                "sm:flex-1 sm:flex-col sm:items-center sm:gap-2 sm:text-center",
            )}
          >
            {/* Connector */}
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[0.6875rem] top-7 h-[calc(100%-1rem)] w-px",
                  styles.connector,
                  orientation === "responsive" &&
                    "sm:left-[calc(50%+1rem)] sm:top-3 sm:h-px sm:w-[calc(100%-2rem)]",
                )}
              />
            )}

            <Hint label={pipelineStageDescriptions[stage.id]}>
              <span
                className={cn(
                  "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border",
                  styles.node,
                )}
              >
                <Icon
                  className={cn("size-3", stage.status === "active" && "animate-spin")}
                  aria-hidden
                />
              </span>
            </Hint>

            <div
              className={cn(
                "min-w-0 pb-4",
                orientation === "responsive" && "sm:pb-0",
              )}
            >
              <p className={cn("text-[12px] font-medium leading-6", styles.label)}>
                {stage.label}
              </p>
              <p className="text-[11px] text-subtle-foreground">
                <span className="sr-only">Stare: </span>
                {stage.status === "active" && stage.progress !== undefined
                  ? `${stage.progress}%`
                  : statusText[stage.status]}
              </p>
              {stage.detail && (
                <p
                  className={cn(
                    "mt-0.5 text-[11px]",
                    stage.status === "failed" ? "text-danger" : "text-muted-foreground",
                  )}
                >
                  {stage.detail}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
