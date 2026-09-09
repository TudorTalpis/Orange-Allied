import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, CircleCheck } from "lucide-react";
import type { DashboardOverview } from "@/types";
import { cn, percentage } from "@/lib/utils";

/**
 * What actually needs the user today, derived from the status distribution
 * rather than hard-coded. Every row is a deep link into the filtered list.
 */
const rows = [
  {
    match: "Eșuate",
    label: "Au eșuat la procesare",
    hint: "Se pot relua din pagina de procesare",
    to: "/documents?status=failed",
    dot: "bg-danger",
  },
  {
    match: "Necesită verificare",
    label: "Așteaptă verificare",
    hint: "Câmpuri extrase cu încredere scăzută",
    to: "/documents?status=needs_review",
    dot: "bg-info",
  },
  {
    match: "În procesare",
    label: "Sunt în lucru",
    hint: "Trec prin OCR, clasificare și indexare",
    to: "/processing",
    dot: "bg-warning",
  },
] as const;

export function AttentionPanel({ overview }: { overview: DashboardOverview }) {
  const countFor = (match: string) =>
    overview.byStatus.find((slice) => slice.label === match)?.value ?? 0;

  const actionable = countFor("Eșuate") + countFor("Necesită verificare");
  const totalDocuments = overview.byStatus.reduce(
    (sum, slice) => sum + slice.value,
    0,
  );

  return (
    <section
      aria-label="Necesită atenție"
      className="flex flex-col overflow-hidden rounded-card border border-border bg-surface"
    >
      <div className="flex items-baseline justify-between gap-3 px-5 py-4">
        <h2 className="text-[15px] font-semibold tracking-tight">Necesită atenție</h2>
        <span
          className={cn(
            "font-mono text-[13px] tabular-nums",
            actionable > 0 ? "text-brand-bright" : "text-success",
          )}
        >
          {actionable}
        </span>
      </div>

      {actionable === 0 && countFor("În procesare") === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 pb-8 text-center">
          <CircleCheck className="size-5 text-success" aria-hidden />
          <p className="text-[13px] text-muted-foreground">
            Totul e în regulă. Nimic nu așteaptă verificare.
          </p>
        </div>
      ) : (
        <ul className="flex-1 border-t border-border">
          {rows.map((row) => {
            const count = countFor(row.match);
            return (
              <li key={row.match} className="border-b border-border last:border-b-0">
                <Link
                  to={row.to}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-raised"
                >
                  <span
                    className={cn("size-1.5 shrink-0 rounded-full", row.dot)}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">
                      {row.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-subtle-foreground">
                      {row.hint}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[15px] tabular-nums">
                    {count}
                  </span>
                  <ChevronRight
                    className="size-3.5 shrink-0 text-subtle-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border px-5 py-3">
        <p className="text-[11.5px] text-subtle-foreground">
          <span className="tabular-nums text-muted-foreground">
            {percentage(countFor("Procesate"), totalDocuments)}%
          </span>{" "}
          din colecție e gata de căutare
        </p>
        <Link
          to="/processing"
          className="flex shrink-0 items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Procesare
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
