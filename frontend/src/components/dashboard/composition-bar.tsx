import { Link } from "react-router-dom";
import type { DistributionSlice } from "@/types";
import { formatNumber, percentage } from "@/lib/utils";

/**
 * The whole collection as one bar. A single stacked mark reads faster than six
 * separate progress rows, and the legend carries the labels and counts so the
 * colours are never the only thing telling the categories apart.
 */
export function CompositionBar({ slices }: { slices: DistributionSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <section aria-label="Compoziția colecției" className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[15px] font-semibold tracking-tight">
          Ce conține colecția
        </h2>
        <Link
          to="/categories"
          className="text-[12.5px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Toate categoriile
        </Link>
      </div>

      <div className="flex h-2.5 gap-[3px] overflow-hidden" role="img"
        aria-label={slices
          .map((slice) => `${slice.label}: ${slice.value} documente`)
          .join(", ")}
      >
        {slices.map((slice, index) => (
          <span
            key={slice.label}
            className={
              index === 0
                ? "rounded-l-full"
                : index === slices.length - 1
                  ? "rounded-r-full"
                  : ""
            }
            style={{
              width: `${(slice.value / total) * 100}%`,
              backgroundColor: slice.color,
            }}
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2 text-[12.5px]">
            <span
              className="size-2 shrink-0 rounded-[3px]"
              style={{ backgroundColor: slice.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">{slice.label}</span>
            <span className="font-mono tabular-nums">{formatNumber(slice.value)}</span>
            <span className="font-mono tabular-nums text-subtle-foreground">
              {percentage(slice.value, total)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
