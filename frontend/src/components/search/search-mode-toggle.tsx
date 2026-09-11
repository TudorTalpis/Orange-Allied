import { Layers, Sparkles, Type } from "lucide-react";
import type { SearchMode } from "@/types";
import { cn } from "@/lib/utils";

const modes: Array<{
  value: SearchMode;
  label: string;
  icon: typeof Type;
  description: string;
}> = [
  {
    value: "keyword",
    label: "Cuvinte-cheie",
    icon: Type,
    description: "Potrivire exactă în numele fișierelor, câmpurile extrase și textul OCR.",
  },
  {
    value: "semantic",
    label: "Semantică",
    icon: Sparkles,
    description:
      "Căutare după sens în indexul documentelor — găsește formulări similare.",
  },
  {
    value: "hybrid",
    label: "Hibrid",
    icon: Layers,
    description: "Ambele, combinate și reordonate. Opțiunea implicită pentru majoritatea întrebărilor.",
  },
];

export function SearchModeToggle({
  value,
  onChange,
}: {
  value: SearchMode;
  onChange: (mode: SearchMode) => void;
}) {
  const active = modes.find((mode) => mode.value === value);

  return (
    <div className="space-y-2">
      <div
        role="radiogroup"
      aria-label="Mod de căutare"
        className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5"
      >
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={value === mode.value}
            onClick={() => onChange(mode.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
              value === mode.value
                ? "bg-surface-overlay text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <mode.icon
              className={cn(
                "size-3.5",
                value === mode.value && mode.value !== "keyword" && "text-brand-bright",
              )}
              aria-hidden
            />
            {mode.label}
          </button>
        ))}
      </div>
      {active && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          {active.description}
        </p>
      )}
    </div>
  );
}
