import { useCallback, useEffect, useRef, useState } from "react";
import { chatApi } from "@/api";
import type {
  AITool,
  ChatConversation,
  ChatMessage,
  ChatToolCall,
} from "@/types";

/**
 * Owns a single conversation: history, the in-flight assistant turn and the
 * tool calls streaming in before the answer text arrives.
 */
export function useChat(initialConversationId?: string) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [pendingToolCalls, setPendingToolCalls] = useState<ChatToolCall[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** The question whose turn failed, kept so Retry can resend it verbatim. */
  const [failedQuestion, setFailedQuestion] = useState<string | null>(null);
  const [tools, setTools] = useState<AITool[]>([]);

  const lastQuestion = useRef<string>("");

  const refreshConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      setConversations(await chatApi.listConversations());
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshConversations();
    chatApi.listTools().then(setTools).catch(() => setTools([]));
  }, [refreshConversations]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);
    chatApi
      .listMessages(conversationId)
      .then((loaded) => {
        if (!cancelled) setMessages(loaded);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || sending) return;

      lastQuestion.current = trimmed;
      setError(null);
      setFailedQuestion(null);
      setSending(true);
      setPendingToolCalls([]);

      // Optimistically render the user's turn.
      const optimistic: ChatMessage = {
        id: `local_${Date.now()}`,
        conversationId: conversationId ?? "pending",
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
        status: "complete",
      };
      setMessages((current) => [...current, optimistic]);

      try {
        const { conversationId: id, message } = await chatApi.sendMessage(
          { conversationId: conversationId ?? undefined, content: trimmed },
          {
            onToolCall: (call) =>
              setPendingToolCalls((current) => [...current, call]),
          },
        );
        setConversationId(id);
        setMessages((current) => [
          ...current.map((entry) =>
            entry.id === optimistic.id ? { ...entry, conversationId: id } : entry,
          ),
          message,
        ]);
        void refreshConversations();
      } catch (cause) {
        // Keep the question on screen, but marked as not delivered, so the user
        // can see exactly what failed and resend it.
        setMessages((current) =>
          current.map((entry) =>
            entry.id === optimistic.id
              ? { ...entry, status: "error" as const }
              : entry,
          ),
        );
        setFailedQuestion(trimmed);
        setError(
          cause instanceof Error ? cause.message : "Asistentul nu a răspuns.",
        );
      } finally {
        setSending(false);
        setPendingToolCalls([]);
      }
    },
    [conversationId, sending, refreshConversations],
  );

  /** Resends the message whose turn failed, after clearing the failed bubble. */
  const retry = useCallback(async () => {
    const question = failedQuestion;
    if (!question) return;
    setMessages((current) =>
      current.filter((entry) => entry.status !== "error"),
    );
    setFailedQuestion(null);
    setError(null);
    await send(question);
  }, [failedQuestion, send]);

  /** Dismisses a failed turn without resending it. */
  const dismissError = useCallback(() => {
    setMessages((current) => current.filter((entry) => entry.status !== "error"));
    setFailedQuestion(null);
    setError(null);
  }, []);

  const regenerate = useCallback(async () => {
    if (!lastQuestion.current) return;
    // Drop the previous answer, then ask the same question again.
    setMessages((current) => {
      const index = current.map((entry) => entry.role).lastIndexOf("assistant");
      return index === -1 ? current : current.slice(0, index);
    });
    const question = lastQuestion.current;
    setMessages((current) =>
      current.filter((entry) => entry.content !== question || entry.role !== "user"),
    );
    await send(question);
  }, [send]);

  const setFeedback = useCallback(
    async (messageId: string, feedback: "up" | "down" | null) => {
      if (!conversationId) return;
      setMessages((current) =>
        current.map((entry) =>
          entry.id === messageId ? { ...entry, feedback } : entry,
        ),
      );
      await chatApi.sendFeedback(conversationId, messageId, feedback);
    },
    [conversationId],
  );

  const startNew = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
    setFailedQuestion(null);
  }, []);

  /** Renames a conversation and reflects it in the sidebar immediately. */
  const rename = useCallback(async (id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    // Optimistic: the list updates before the service resolves.
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, title: trimmed } : conversation,
      ),
    );
    try {
      await chatApi.renameConversation(id, trimmed);
    } finally {
      void refreshConversations();
    }
  }, [refreshConversations]);

  const remove = useCallback(
    async (id: string) => {
      await chatApi.deleteConversation(id);
      if (id === conversationId) startNew();
      void refreshConversations();
    },
    [conversationId, startNew, refreshConversations],
  );

  const latestSources =
    [...messages].reverse().find((message) => message.sources?.length)?.sources ??
    [];

  return {
    conversations,
    conversationsLoading,
    conversationId,
    setConversationId,
    messages,
    messagesLoading,
    pendingToolCalls,
    sending,
    error,
    failedQuestion,
    tools,
    latestSources,
    send,
    retry,
    dismissError,
    rename,
    regenerate,
    setFeedback,
    startNew,
    remove,
  };
}
