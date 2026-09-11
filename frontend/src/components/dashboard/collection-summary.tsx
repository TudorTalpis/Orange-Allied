import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { DashboardOverview } from "@/types";
import { cn, formatNumber } from "@/lib/utils";

/**
 * The dashboard's focal point: one dominant number, the 30-day shape behind it,
 * and the secondary figures demoted to a footer strip rather than competing as
 * equal tiles.
 */
export function CollectionSummary({ overview }: { overview: DashboardOverview }) {
  const stat = (id: string) => overview.stats.find((item) => item.id === id);
  const total = stat("total");
  const delta = total?.delta ?? 0;
  const positive = delta >= 0;
  const DeltaIcon = positive ? TrendingUp : TrendingDown;

  const series = overview.processedOverTime;
  const processedThisPeriod = series.reduce((sum, point) => sum + point.processed, 0);

  const footer = [
    { label: "Gata de căutare", value: stat("processed")?.value ?? "—" },
    { label: "În procesare", value: stat("processing")?.value ?? "—", accent: true },
    { label: "Categorii", value: stat("categories")?.value ?? "—" },
  ];

  const storageUsed = stat("storage")?.rawValue ?? 0;
  const storagePercent = Math.min(100, Math.round((storageUsed / 8) * 100));

  return (
    <section
      aria-label="Colecția ta"
      className="relative overflow-hidden rounded-card border border-border surface-gradient"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-primary/12 blur-[90px]"
      />

      <div className="relative px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-subtle-foreground">
            Colecția ta
          </p>
          <p className="text-[11px] text-subtle-foreground">Ultimele 30 de zile</p>
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[2.5rem] font-semibold leading-none tracking-tight tabular-nums">
            {total?.value ?? "—"}
          </span>
          <span className="text-[13px] text-muted-foreground">documente</span>
          <span
            className={cn(
              "ml-auto flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
              positive
                ? "border-success-border bg-success-muted text-success"
                : "border-warning-border bg-warning-muted text-warning",
            )}
          >
            <DeltaIcon className="size-3" aria-hidden />
            {positive ? "+" : ""}
            {delta}%
          </span>
        </div>

        <p className="mt-1.5 text-[12.5px] text-muted-foreground">
          <span className="text-foreground tabular-nums">
            {formatNumber(processedThisPeriod)}
          </span>{" "}
          documente procesate în această perioadă
        </p>
      </div>

      {/* The shape of the month — one series, so the label above names it. */}
      <div className="relative mt-3 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="collection-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C3163A" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#C3163A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip
              cursor={{ stroke: "#4A3F3D", strokeWidth: 1 }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-lg border border-border bg-surface-overlay px-2.5 py-1.5 shadow-2xl">
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(String(label)).toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="font-mono text-[12px] tabular-nums">
                      {payload[0].value} procesate
                    </p>
                  </div>
                ) : null
              }
            />
            <Area
              type="monotone"
              dataKey="processed"
              stroke="#C3163A"
              strokeWidth={2}
              fill="url(#collection-fill)"
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: "#131010" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Secondary figures, demoted to a footer strip. */}
      <div className="relative grid grid-cols-2 border-t border-border sm:grid-cols-4">
        {footer.map((item) => (
          <div
            key={item.label}
            className="border-b border-r border-border px-5 py-3 last:border-r-0 sm:border-b-0"
          >
            <p className="text-[11px] text-subtle-foreground">{item.label}</p>
            <p
              className={cn(
                "mt-0.5 text-[17px] font-semibold tabular-nums",
                item.accent && "text-brand-bright",
              )}
            >
              {item.value}
            </p>
          </div>
        ))}

        <div className="border-b border-border px-5 py-3 sm:border-b-0">
          <p className="text-[11px] text-subtle-foreground">Stocare</p>
          <p className="mt-0.5 text-[17px] font-semibold tabular-nums">
            {stat("storage")?.value ?? "—"}
          </p>
          <div
            className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-overlay"
            role="meter"
            aria-valuenow={storagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Spațiu de stocare utilizat"
          >
            <div
              className="h-full rounded-full brand-gradient"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
