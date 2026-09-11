import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronDown,
  Copy,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/auth-provider";
import type { ChatMessage as ChatMessageType } from "@/types";
import { cn, initials } from "@/lib/utils";
import { DocumentResultCard } from "./document-result-card";
import { SourceReference } from "./source-reference";

interface ChatMessageProps {
  message: ChatMessageType;
  onFeedback?: (feedback: "up" | "down" | null) => void;
  onRegenerate?: () => void;
  isLast?: boolean;
}

function ToolCallList({ message }: { message: ChatMessageType }) {
  const [open, setOpen] = useState(false);
  if (!message.toolCalls?.length) return null;

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md text-[11.5px] text-subtle-foreground transition-colors hover:text-muted-foreground"
      >
        <Wrench className="size-3" aria-hidden />
        A folosit {message.toolCalls.length} instrument
        {message.toolCalls.length === 1 ? "" : "e"}
        <ChevronDown
          className={cn("size-3 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <ul className="mt-2 space-y-1.5">
          {message.toolCalls.map((call) => (
            <li
              key={call.id}
              className="rounded-lg border border-border bg-surface-raised px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[12px] font-medium">
                  <Check className="size-3 text-success" aria-hidden />
                  {call.label}
                </span>
                {call.durationMs !== undefined && (
                  <span className="font-mono text-[10px] tabular-nums text-subtle-foreground">
                    {call.durationMs} ms
                  </span>
                )}
              </div>
              <code className="mt-1 block overflow-x-auto whitespace-pre font-mono text-[10.5px] text-subtle-foreground">
                {call.tool}({JSON.stringify(call.arguments)})
              </code>
              {call.resultSummary && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  → {call.resultSummary}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ChatMessageBubble({
  message,
  onFeedback,
  onRegenerate,
  isLast,
}: ChatMessageProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (message.role === "user") {
    const undelivered = message.status === "error";
    return (
      <article className="flex justify-end gap-3">
        <div
          className={cn(
            "max-w-[42rem] rounded-2xl rounded-tr-sm border px-3.5 py-2.5",
            undelivered
              ? "border-danger-border bg-danger-muted/50"
              : "border-primary-border bg-primary-subtle",
          )}
        >
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
            {message.content}
          </p>
          {undelivered && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-danger">
              <TriangleAlert className="size-3" aria-hidden />
              Nelivrat
            </p>
          )}
        </div>
        <Avatar className="mt-0.5 size-7 shrink-0">
          <AvatarFallback className="bg-surface-overlay bg-none text-muted-foreground">
            {initials(user?.fullName ?? "Tu")}
          </AvatarFallback>
        </Avatar>
      </article>
    );
  }

  return (
    <article className="flex gap-3">
      <span
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full brand-gradient"
        aria-hidden
      >
        <Sparkles className="size-3.5 text-primary-foreground" />
      </span>

      <div className="min-w-0 max-w-[46rem] flex-1">
        <ToolCallList message={message} />

        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
          {message.content}
        </p>

        {message.documents && message.documents.length > 0 && (
          <ol className="mt-3 space-y-2">
            {message.documents.map((entry, index) => (
              <li key={entry.document.id}>
                <DocumentResultCard
                  index={index + 1}
                  document={entry.document}
                  reason={entry.reason}
                />
              </li>
            ))}
          </ol>
        )}

        {message.sources && message.sources.length > 0 && (
          <section className="mt-3.5" aria-label="Surse">
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
              Surse
            </h3>
            <ul className="space-y-1">
              {message.sources.map((source) => (
                <li key={source.id}>
                  <SourceReference source={source} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-3 flex items-center gap-0.5">
          <Hint label={copied ? "Copiat" : "Copiază răspunsul"}>
            <Button variant="ghost" size="icon-sm" onClick={copy} aria-label="Copiază răspunsul">
              {copied ? <Check className="text-success" /> : <Copy />}
            </Button>
          </Hint>
          {isLast && onRegenerate && (
            <Hint label="Regenerează">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRegenerate}
                aria-label="Regenerează acest răspuns"
              >
                <RefreshCw />
              </Button>
            </Hint>
          )}
          <span className="mx-1 h-3.5 w-px bg-border" aria-hidden />
          <Hint label="Util">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onFeedback?.(message.feedback === "up" ? null : "up")}
              aria-label="Marchează răspunsul ca util"
              aria-pressed={message.feedback === "up"}
              className={cn(message.feedback === "up" && "text-success")}
            >
              <ThumbsUp />
            </Button>
          </Hint>
          <Hint label="Inutil">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onFeedback?.(message.feedback === "down" ? null : "down")}
              aria-label="Marchează răspunsul ca inutil"
              aria-pressed={message.feedback === "down"}
              className={cn(message.feedback === "down" && "text-danger")}
            >
              <ThumbsDown />
            </Button>
          </Hint>
        </div>
      </div>
    </article>
  );
}

/** The thinking state: tool calls stream in before the answer text. */
export function ChatThinking({
  toolCalls,
}: {
  toolCalls: ChatMessageType["toolCalls"];
}) {
  return (
    <article className="flex gap-3" aria-live="polite">
      <span
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full brand-gradient"
        aria-hidden
      >
        <Sparkles className="size-3.5 animate-pulse-soft text-primary-foreground" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        {toolCalls?.map((call) => (
          <p
            key={call.id}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground animate-fade-in"
          >
            <Check className="size-3 text-success" aria-hidden />
            {call.label}
            {call.resultSummary && (
              <span className="text-subtle-foreground">· {call.resultSummary}</span>
            )}
          </p>
        ))}
        <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="size-1.5 animate-typing rounded-full bg-brand-bright"
                style={{ animationDelay: `${index * 0.16}s` }}
              />
            ))}
          </span>
          Îți citesc documentele
        </p>
      </div>
    </article>
  );
}

export { Link };
