import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "@/components/common/confidence-meter";
import type { QueryInterpretation } from "@/types";

/**
 * Shows how the natural-language query was turned into structured constraints.
 * Rendering this is what separates "magic" from a system the user can correct.
 */
export function QueryInterpretationCard({
  interpretation,
}: {
  interpretation: QueryInterpretation;
}) {
  return (
    <section
      aria-label="Cum a fost interpretată interogarea"
      className="rounded-card border border-primary-border bg-primary-subtle/60 p-4"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-md brand-gradient">
          <Sparkles className="size-3 text-primary-foreground" aria-hidden />
        </span>
        <h2 className="text-[13px] font-medium">AI a interpretat interogarea astfel</h2>
        <Badge variant="outline" className="ml-auto">
          {interpretation.constraints.length}{" "}
          {interpretation.constraints.length === 1 ? "constrângere" : "constrângeri"}
        </Badge>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {interpretation.constraints.map((constraint) => (
          <li
            key={`${constraint.field}-${constraint.operator}-${constraint.value}`}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5"
          >
            <span className="text-[12px] text-muted-foreground">{constraint.field}</span>
            <span className="font-mono text-[12px] text-brand-bright">
              {constraint.operator}
            </span>
            <span className="text-[12px] font-medium">{constraint.value}</span>
            <ConfidenceMeter
              value={constraint.confidence}
              showLabel={false}
              className="ml-1"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
