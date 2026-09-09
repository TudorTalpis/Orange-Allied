import { useEffect, useRef } from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  busy,
  onAttach,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  busy: boolean;
  onAttach?: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grow with the content, up to a ceiling.
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 180)}px`;
  }, [value]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!busy) onSubmit();
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy) onSubmit();
      }}
      className="border-t border-border bg-background/85 p-3 backdrop-blur-md lg:p-4"
    >
      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border border-border bg-surface p-2 transition-colors",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25",
        )}
      >
        {onAttach && (
          <Hint label="Atașează un document">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onAttach}
              aria-label="Atașează un document"
            >
              <Paperclip />
            </Button>
          </Hint>
        )}

        <label htmlFor="chat-input" className="sr-only">
          Întreabă despre documentele tale
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Întreabă despre documentele tale…"
          className="max-h-44 flex-1 resize-none bg-transparent py-1.5 text-[13.5px] leading-relaxed outline-none placeholder:text-subtle-foreground"
        />

        {busy && onStop ? (
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            onClick={onStop}
            aria-label="Oprește generarea"
          >
            <Square />
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="icon-sm"
            disabled={!value.trim() || busy}
            aria-label="Trimite mesajul"
          >
            <ArrowUp />
          </Button>
        )}
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-subtle-foreground">
        Răspunsurile sunt generate doar din documentele tale. În această
        versiune ele provin din stratul de servicii simulat.
      </p>
    </form>
  );
}
