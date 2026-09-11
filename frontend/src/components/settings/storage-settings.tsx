import { HardDrive } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { StorageSettings } from "@/types";
import { formatBytes, percentage } from "@/lib/utils";
import { SettingsSection } from "./settings-section";

const barColors = ["#C3163A", "#C98500", "#3987E5", "#199E70"];

export function StorageSettingsSection({ value }: { value: StorageSettings }) {
  const used = percentage(value.usedBytes, value.quotaBytes);

  return (
    <SettingsSection
      title="Stocare"
      description="Originale, previzualizări generate, straturi de text recuperate și indexul vectorial."
    >
      <div className="rounded-xl border border-border bg-surface-raised p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <HardDrive className="size-3.5" aria-hidden />
              Utilizat
            </p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums">
              {formatBytes(value.usedBytes)}
            </p>
          </div>
          <p className="text-[12px] text-muted-foreground tabular-nums">
            din {formatBytes(value.quotaBytes)} · {used}%
          </p>
        </div>
        <Progress
          value={used}
          tone={used > 85 ? "warning" : "primary"}
          className="mt-3"
          aria-label="Spațiu utilizat"
        />
      </div>

      <ul className="space-y-2.5">
        {value.breakdown.map((entry, index) => (
          <li key={entry.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-[12.5px]">
              <span className="flex items-center gap-2">
                <span
                  className="size-2 rounded-[3px]"
                  style={{ backgroundColor: barColors[index % barColors.length] }}
                  aria-hidden
                />
                <span className="text-muted-foreground">{entry.label}</span>
              </span>
              <span className="font-mono tabular-nums">{formatBytes(entry.bytes)}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-surface-overlay">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${percentage(entry.bytes, value.usedBytes)}%`,
                  backgroundColor: barColors[index % barColors.length],
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="text-[12px] text-muted-foreground">
        {value.documentCount.toLocaleString()} documente · originalele sunt
        păstrate {value.retentionDays} de zile după ștergere.
      </p>
    </SettingsSection>
  );
}
