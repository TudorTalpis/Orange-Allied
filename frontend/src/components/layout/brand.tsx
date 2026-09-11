import { config } from "@/lib/config";
import { cn } from "@/lib/utils";

/** The product mark: a burgundy monogram tile plus the wordmark. */
export function Brand({
  collapsed,
  compact,
  className,
}: {
  /** Icon only — used by the collapsed sidebar. */
  collapsed?: boolean;
  /** Wordmark without the tagline, for tight headers. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] brand-gradient shadow-[0_8px_20px_-10px_rgba(195,22,58,0.9)]">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path
            d="M6 4h6a8 8 0 0 1 0 16H6z"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="17.5" cy="6" r="2" fill="white" />
        </svg>
      </span>
      {!collapsed && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight">
            {config.appName}
          </span>
          {!compact && (
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-subtle-foreground">
              {config.appTagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
