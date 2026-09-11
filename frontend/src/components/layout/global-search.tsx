import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The header search field. It does not search inline — it hands the query to
 * the dedicated Search page, which owns modes, filters and interpretation.
 */
export function GlobalSearch({ className }: { className?: string }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const query = value.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    inputRef.current?.blur();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative w-full max-w-md", className)}
    >
      <label htmlFor="global-search" className="sr-only">
        Caută documente
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle-foreground"
        aria-hidden
      />
      <input
        id="global-search"
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Caută documente…"
        className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-16 text-[13px] text-foreground transition-colors placeholder:text-subtle-foreground hover:border-border-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <kbd
        className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-subtle-foreground sm:block"
        aria-hidden
      >
        ⌘K
      </kbd>
    </form>
  );
}
