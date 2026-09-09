import { cn } from "@/lib/utils";

/**
 * A compact confidence readout. Colour encodes the review threshold used by
 * the validation stage rather than an arbitrary gradient.
 */
export function ConfidenceMeter({
  value,
  showLabel = true,
  className,
}: {
  value: number;
  showLabel?: boolean;
  className?: string;
}) {
  const percent = Math.round(value * 100);
  const tone =
    value >= 0.9 ? "success" : value >= 0.7 ? "warning" : "danger";
  const barColor = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  }[tone];
  const textColor = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  }[tone];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-1 w-12 overflow-hidden rounded-full bg-surface-overlay"
        role="meter"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Încredere la extragere"
      >
        <div className={cn("h-full rounded-full", barColor)} style={{ width: `${percent}%` }} />
      </div>
      {showLabel && (
        <span className={cn("font-mono text-[11px] tabular-nums", textColor)}>
          {percent}%
        </span>
      )}
    </div>
  );
}
