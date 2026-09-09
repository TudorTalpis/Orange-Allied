import { CircleCheck, Plug } from "lucide-react";
import { DynamicIcon } from "@/components/common/icon";
import type { AITool, ChatSource } from "@/types";
import { cn } from "@/lib/utils";
import { SourceReference } from "./source-reference";

/**
 * The right-hand context panel: which documents the current answer drew on, and
 * which application tools the assistant is allowed to call.
 *
 * These tools are served by the backend over MCP. The frontend never executes
 * them — it only shows what the assistant may reach for.
 */
export function AIToolsPanel({
  tools,
  sources,
  className,
}: {
  tools: AITool[];
  sources: ChatSource[];
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col overflow-y-auto", className)}>
      <section className="border-b border-border p-4" aria-label="Documente referite">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
          Documente referite
        </h2>
        {sources.length === 0 ? (
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            Documentele citate de asistent în răspuns apar aici, împreună cu
            pasajul folosit.
          </p>
        ) : (
          <ul className="mt-2.5 space-y-1">
            {sources.map((source) => (
              <li key={source.id}>
                <SourceReference source={source} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-4" aria-label="Instrumente AI">
        <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
          <Plug className="size-3" aria-hidden />
          Instrumente AI
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          Asistentul răspunde doar din acest spațiu de lucru. Ajunge la
          documentele tale printr-un set fix de instrumente ale aplicației, nu
          prin acces liber.
        </p>

        <ul className="mt-3 space-y-1.5">
          {tools.map((tool) => (
            <li
              key={tool.id}
              className={cn(
                "rounded-lg border px-2.5 py-2",
                tool.enabled
                  ? "border-border bg-surface-raised"
                  : "border-dashed border-border bg-transparent opacity-60",
              )}
            >
              <div className="flex items-center gap-2">
                <DynamicIcon
                  name={tool.icon}
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
                <span className="flex-1 truncate text-[12.5px] font-medium">
                  {tool.name}
                </span>
                {tool.enabled ? (
                  <CircleCheck className="size-3.5 shrink-0 text-success" aria-label="Activat" />
                ) : (
                  <span className="text-[10px] uppercase tracking-wider text-subtle-foreground">
                    oprit
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
