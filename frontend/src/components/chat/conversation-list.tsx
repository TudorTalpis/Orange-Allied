import { MessageSquarePlus, MoreHorizontal, Pencil, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatConversation } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";

export function ConversationList({
  conversations,
  loading,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: {
  conversations: ChatConversation[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (conversation: ChatConversation) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button variant="secondary" className="w-full justify-start" onClick={onCreate}>
          <MessageSquarePlus />
          Conversație nouă
        </Button>
      </div>

      <nav aria-label="Istoricul conversațiilor" className="flex-1 overflow-y-auto px-2 pb-3">
        <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle-foreground">
          Istoric
        </p>

        {loading && (
          <div className="space-y-1.5 px-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-lg" />
            ))}
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <p className="px-2 py-4 text-[12px] leading-relaxed text-muted-foreground">
            Încă nu ai conversații. Pune o întrebare ca să începi una.
          </p>
        )}

        <ul className="space-y-0.5">
          {conversations.map((conversation) => (
            <li key={conversation.id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                aria-current={conversation.id === activeId ? "true" : undefined}
                className={cn(
                  "w-full rounded-lg px-2.5 py-2 pr-8 text-left transition-colors",
                  conversation.id === activeId
                    ? "bg-primary-subtle"
                    : "hover:bg-surface-raised",
                )}
              >
                <span className="flex items-center gap-1.5">
                  {conversation.pinned && (
                    <Pin className="size-3 shrink-0 text-brand-bright" aria-label="Fixată" />
                  )}
                  <span className="truncate text-[13px] font-medium">
                    {conversation.title}
                  </span>
                </span>
                {conversation.preview && (
                  <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
                    {conversation.preview}
                  </span>
                )}
                <span className="mt-0.5 block text-[10.5px] text-subtle-foreground">
                  {formatRelativeTime(conversation.updatedAt)} ·{" "}
                  {conversation.messageCount} mesaj
                  {conversation.messageCount === 1 ? "" : "e"}
                </span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1 top-1.5 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                    aria-label={`Acțiuni pentru ${conversation.title}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onRename(conversation)}>
                    <Pencil />
                    Redenumește
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    destructive
                    onSelect={() => onDelete(conversation.id)}
                  >
                    <Trash2 />
                    Șterge conversația
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
