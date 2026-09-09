import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suggestedPrompts } from "@/data/mockChat";

/**
 * A slim entry into the assistant. Deliberately a band rather than a card: it
 * closes the page without competing with the panels above it.
 */
export function AIPromptCard() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    navigate(`/chat?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section
      aria-label="Întreabă asistentul"
      className="relative overflow-hidden rounded-card border border-primary-border surface-gradient"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/20 blur-[90px]"
      />

      <div className="relative flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-start gap-3 lg:w-64 lg:shrink-0">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg brand-gradient">
            <Sparkles className="size-3.5 text-primary-foreground" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold tracking-tight">
              Întreabă documentele tale
            </h2>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              Răspunsurile citează documentele folosite.
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask(value);
            }}
            className="flex gap-2"
          >
            <label htmlFor="dashboard-ask" className="sr-only">
              Întreabă asistentul de documente
            </label>
            <input
              id="dashboard-ask"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Găsește facturile peste 25.000 $ din 2025–2026"
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-canvas/60 px-3.5 text-[13px] transition-colors placeholder:text-subtle-foreground hover:border-border-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button type="submit" variant="primary" className="shrink-0">
              Întreabă
            </Button>
          </form>

          <ul className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt) => (
              <li key={prompt.label}>
                <button
                  type="button"
                  onClick={() => ask(prompt.prompt)}
                  className="group flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:border-primary-border hover:bg-primary-subtle hover:text-foreground"
                >
                  {prompt.label}
                  <ArrowUpRight
                    className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
