import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { History, PanelRight, RefreshCw, Sparkles, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { RenameDialog } from "@/components/documents/rename-dialog";
import { DynamicIcon } from "@/components/common/icon";
import { useChat } from "@/hooks/useChat";
import { ConversationList } from "@/components/chat/conversation-list";
import { AIToolsPanel } from "@/components/chat/ai-tools-panel";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageBubble, ChatThinking } from "@/components/chat/chat-message";
import { suggestedPrompts } from "@/data/mockChat";
import type { ChatConversation } from "@/types";
import { useSettings } from "@/providers/settings-provider";

export default function ChatPage() {
  const { conversationId: routeConversationId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const chat = useChat(routeConversationId);
  const { settings } = useSettings();

  const [draft, setDraft] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [renaming, setRenaming] = useState<ChatConversation | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seededQuery = useRef(false);

  // A question handed over from the dashboard or a document page.
  useEffect(() => {
    const question = params.get("q");
    if (question && !seededQuery.current) {
      seededQuery.current = true;
      setParams({}, { replace: true });
      void chat.send(question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat.messages, chat.pendingToolCalls, chat.sending]);

  function handleSelect(id: string) {
    chat.setConversationId(id);
    setHistoryOpen(false);
    navigate(`/chat/${id}`, { replace: true });
  }

  function handleNew() {
    chat.startNew();
    setHistoryOpen(false);
    navigate("/chat", { replace: true });
  }

  async function handleDelete(id: string) {
    await chat.remove(id);
    toast.success("Conversația a fost ștearsă");
  }

  function handleSend() {
    const question = draft;
    setDraft("");
    void chat.send(question);
  }

  const empty = chat.messages.length === 0 && !chat.sending;
  const modelLabel =
    settings?.ai.providerKind === "local"
      ? `${settings.ai.localModel} · local`
      : (settings?.ai.cloudModel ?? "not configured");

  const conversationPanel = (
    <ConversationList
      conversations={chat.conversations}
      loading={chat.conversationsLoading}
      activeId={chat.conversationId}
      onSelect={handleSelect}
      onCreate={handleNew}
      onRename={setRenaming}
      onDelete={handleDelete}
    />
  );

  return (
    /* The chat fills the shell: it manages its own scrolling rather than the page. */
    <div className="-mx-4 -my-6 flex h-[calc(100vh-3.5rem)] lg:-mx-8 lg:-my-8">
      {/* Conversation history */}
      <aside className="hidden w-64 shrink-0 border-r border-border xl:block">
        {conversationPanel}
      </aside>

      {/* Conversation */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-13 shrink-0 items-center gap-2 border-b border-border px-3 py-2.5 lg:px-4">
          <Button
            variant="ghost"
            size="icon-sm"
            className="xl:hidden"
            onClick={() => setHistoryOpen(true)}
            aria-label="Deschide istoricul conversațiilor"
          >
            <History />
          </Button>

          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-lg brand-gradient"
            aria-hidden
          >
            <Sparkles className="size-3.5 text-primary-foreground" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[13.5px] font-semibold">
              Asistent AI pentru documente
            </h1>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Pregătit · {modelLabel}
            </p>
          </div>

          <Badge variant="primary" className="ml-auto hidden sm:inline-flex">
            {chat.tools.filter((tool) => tool.enabled).length} instrumente active
          </Badge>

          <Button
            variant="ghost"
            size="icon-sm"
            className="2xl:hidden"
            onClick={() => setContextOpen(true)}
            aria-label="Deschide sursele și instrumentele"
          >
            <PanelRight />
          </Button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-5 lg:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {chat.messagesLoading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-xl" />
                ))}
              </div>
            )}

            {!chat.messagesLoading && empty && (
              <div className="py-8 text-center">
                <span
                  className="mx-auto flex size-12 items-center justify-center rounded-2xl brand-gradient ai-glow"
                  aria-hidden
                >
                  <Sparkles className="size-5 text-primary-foreground" />
                </span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  Întreabă orice despre documentele tale
                </h2>
                <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                  Asistentul caută în colecția ta, citește ce găsește și îți
                  răspunde indicând documentele folosite. Nu răspunde niciodată
                  pe baza a ceva din afara acestui spațiu de lucru.
                </p>

                <ul className="mx-auto mt-6 grid max-w-xl gap-2 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt) => (
                    <li key={prompt.label}>
                      <button
                        type="button"
                        onClick={() => void chat.send(prompt.prompt)}
                        className="flex w-full items-start gap-2.5 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-primary-border hover:bg-primary-subtle"
                      >
                        <DynamicIcon
                          name={prompt.icon}
                          className="mt-0.5 size-3.5 shrink-0 text-brand-bright"
                        />
                        <span className="text-[12.5px] leading-snug">
                          {prompt.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {chat.messages.map((message, index) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                isLast={
                  index === chat.messages.length - 1 && message.role === "assistant"
                }
                onFeedback={(feedback) => void chat.setFeedback(message.id, feedback)}
                onRegenerate={() => void chat.regenerate()}
              />
            ))}

            {chat.sending && <ChatThinking toolCalls={chat.pendingToolCalls} />}

            {chat.error && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-xl border border-danger-border bg-danger-muted/50 p-3.5 sm:flex-row sm:items-center"
              >
                <TriangleAlert
                  className="size-4 shrink-0 text-danger"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground">
                    Asistentul nu a putut răspunde
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {chat.error} Întrebarea ta este încă aici — retrimite-o când
                    ești pregătit.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => void chat.retry()}
                    loading={chat.sending}
                  >
                    <RefreshCw />
                    Încearcă din nou
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={chat.dismissError}
                    aria-label="Închide această eroare"
                  >
                    <X />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSubmit={handleSend}
          busy={chat.sending}
          onAttach={() =>
            toast.info("Atașamentele vor fi disponibile odată cu backendul", {
              description: "Între timp, încarcă documente din pagina Încărcare.",
            })
          }
        />
      </div>

      {/* Sources and tools */}
      <aside className="hidden w-72 shrink-0 border-l border-border 2xl:block">
        <AIToolsPanel tools={chat.tools} sources={chat.latestSources} />
      </aside>

      {/* Mobile drawers */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Istoric conversații</SheetTitle>
          {conversationPanel}
        </SheetContent>
      </Sheet>

      <Sheet open={contextOpen} onOpenChange={setContextOpen}>
        <SheetContent side="right" className="p-0">
          <SheetTitle className="sr-only">Surse și instrumente AI</SheetTitle>
          <AIToolsPanel tools={chat.tools} sources={chat.latestSources} />
        </SheetContent>
      </Sheet>

      <RenameDialog
        open={Boolean(renaming)}
        onOpenChange={(open) => !open && setRenaming(null)}
        currentName={renaming?.title ?? ""}
        title="Redenumește conversația"
        description="Dă acestei conversații un nume pe care îl vei recunoaște mai târziu."
        fieldLabel="Nume conversație"
        onRename={async (title) => {
          if (!renaming) return;
          await chat.rename(renaming.id, title);
          setRenaming(null);
          toast.success("Conversația a fost redenumită");
        }}
      />
    </div>
  );
}
