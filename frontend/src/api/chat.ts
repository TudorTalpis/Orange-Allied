import { config } from "@/lib/config";
import { mockAITools, mockAnswerDocumentIds } from "@/data/mockChat";
import { formatCurrency, formatDate, sleep, uid } from "@/lib/utils";
import type {
  AITool,
  ExtractedField,
  ChatConversation,
  ChatMessage,
  ChatSource,
  ChatToolCall,
  Document,
  SendMessagePayload,
} from "@/types";
import { ApiError, http } from "./client";
import { mockLatency } from "./mockDelay";
import { mockStore } from "./mockStore";

/** How often a mocked assistant turn fails, so the error path stays exercised. */
const MOCK_FAILURE_RATE = 0.1;

/* ------------------------------------------------------------------ */
/*  Mock answer planner                                                */
/*  Chooses which documents to cite and composes a plausible answer.   */
/* ------------------------------------------------------------------ */

interface PlannedAnswer {
  content: string;
  documents: Document[];
  toolCalls: ChatToolCall[];
}

function toolCall(
  tool: string,
  label: string,
  args: Record<string, unknown>,
  resultSummary: string,
): ChatToolCall {
  return {
    id: uid("tc"),
    tool,
    label,
    arguments: args,
    status: "completed",
    resultSummary,
    durationMs: 80 + Math.round(Math.random() * 420),
  };
}

/* ------------------------------------------------------------------ */
/*  Document-grounded answers                                          */
/*  The assistant answers from the workspace, so a question naming a    */
/*  document and a field is resolved against the stored extraction      */
/*  rather than a canned branch.                                        */
/* ------------------------------------------------------------------ */

const STOP_WORDS = new Set([
  "care", "este", "care", "din", "pentru", "care", "cat", "cât", "sunt", "ce",
  "the", "what", "when", "total", "totalul", "suma", "valoarea", "factura",
  "facturii", "documentul", "documentului", "mea", "meu", "este", "are", "cu",
  "la", "de", "si", "și", "pe", "un", "o", "al", "ai",
]);

interface FieldIntent {
  pattern: RegExp;
  keys: string[];
  phrase: (value: string, doc: Document) => string;
}

const FIELD_INTENTS: FieldIntent[] = [
  {
    pattern: /scaden|termen de plat|due|pân[ăa] c[âa]nd/i,
    keys: ["dueDate", "coverageEnd", "endDate"],
    phrase: (value) => `Termenul de plată este ${value}.`,
  },
  {
    pattern: /tva|vat/i,
    keys: ["tax"],
    phrase: (value) => `TVA-ul este ${value}.`,
  },
  {
    pattern: /subtotal/i,
    keys: ["subtotal"],
    phrase: (value) => `Subtotalul este ${value}.`,
  },
  {
    pattern: /total|sum[ăa]|valoare|c[âa]t (costă|face|e)/i,
    keys: ["amount", "premium"],
    phrase: (value) => `Totalul este ${value}.`,
  },
  {
    pattern: /num[ăa]r|nr\.?\s|invoice number/i,
    keys: ["invoiceNumber", "policyNumber"],
    phrase: (value) => `Numărul documentului este ${value}.`,
  },
  {
    pattern: /furnizor|emitent|cine a emis|supplier/i,
    keys: ["company", "merchant", "counterparty", "insurer", "issuer"],
    phrase: (value) => `Documentul a fost emis de ${value}.`,
  },
  {
    pattern: /client|beneficiar|customer/i,
    keys: ["customer"],
    phrase: (value) => `Clientul este ${value}.`,
  },
  {
    pattern: /data emiterii|emis[ăa]? (la|pe)|issue date/i,
    keys: ["date", "effectiveDate", "coverageStart"],
    phrase: (value) => `Data emiterii este ${value}.`,
  },
];

function formatFieldValue(field: ExtractedField): string {
  if (field.value === null || field.value === undefined) return "—";
  switch (field.type) {
    case "currency":
      return formatCurrency(Number(field.value), field.currency);
    case "date":
      return formatDate(String(field.value), "long");
    case "number":
      return Number(field.value).toLocaleString("ro-RO");
    case "boolean":
      return field.value ? "da" : "nu";
    case "list":
      return (field.value as string[]).join(", ");
    default:
      return String(field.value);
  }
}

/** Scores documents by how strongly the question names them. */
function findReferencedDocuments(question: string): Document[] {
  const tokens = question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  if (tokens.length === 0) return [];

  return mockStore.documents
    .map((doc) => {
      const identity = [
        doc.name,
        doc.metadata?.company,
        doc.metadata?.customer,
        doc.metadata?.invoiceNumber,
        ...(doc.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const score = tokens.filter((token) => identity.includes(token)).length;
      return { doc, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.doc);
}

/**
 * Resolves "what is the total of the Acme invoice?" against the stored
 * extraction. Returns null when the question is not of that shape, so the
 * broader branches below still handle it.
 */
function answerFromExtraction(question: string): PlannedAnswer | null {
  const intent = FIELD_INTENTS.find((entry) => entry.pattern.test(question));
  if (!intent) return null;

  const matches = findReferencedDocuments(question);
  const doc = matches[0];
  if (!doc) return null;

  const fields = doc.metadata?.fields ?? [];
  const field = intent.keys
    .map((key) => fields.find((entry) => entry.key === key))
    .find(Boolean);

  if (!field) return null;

  const value = formatFieldValue(field);
  const subject = doc.metadata?.company ?? doc.name;

  return {
    content: `${intent.phrase(value, doc)} Valoarea provine din ${doc.name}${
      field.page ? `, pagina ${field.page}` : ""
    }, extrasă cu o încredere de ${Math.round(field.confidence * 100)}%. Documentul a fost emis de ${subject}.`,
    documents: [doc],
    toolCalls: [
      toolCall(
        "search_documents",
        "Am căutat documentul",
        { query: question, mode: "hybrid" },
        `${matches.length} documente potrivite`,
      ),
      toolCall(
        "query_metadata",
        "Am citit câmpul extras",
        { documentId: doc.id, field: field.key },
        `${field.label}: ${value}`,
      ),
    ],
  };
}

function planAnswer(question: string): PlannedAnswer {
  const lower = question.toLowerCase();
  const documents = mockStore.documents;

  // A question that names a document and a field is answered from the
  // extraction itself, with the page it came from.
  const grounded = answerFromExtraction(question);
  if (grounded) return grounded;

  if (/gdpr|data protection|privacy/.test(lower)) {
    const matches = documents.filter((doc) =>
      doc.tags?.includes("gdpr") ||
      doc.aiSummary?.toLowerCase().includes("gdpr"),
    );
    return {
      content: `Am găsit ${matches.length} documente cu obligații GDPR explicite. Acordul de prelucrare a datelor cu Stark Industries are cele mai stricte clauze — notificarea incidentelor în 72 de ore și o listă nominală de sub-împuterniciți — în timp ce NDA-ul cu Vertex Analytics garantează rezidența datelor exclusiv în UE. Niciunul dintre acorduri nu permite transferuri în afara SEE fără Clauze Contractuale Standard.`,
      documents: matches,
      toolCalls: [
        toolCall(
          "search_documents",
          "Am căutat în documente",
          { query: "GDPR data processing obligations", mode: "semantic" },
          `${matches.length} documente au corespuns`,
        ),
        toolCall(
          "retrieve_document",
          "Am citit secțiunile relevante",
          { documentIds: matches.map((doc) => doc.id) },
          "Au fost citite 3 secțiuni de clauze",
        ),
      ],
    };
  }

  if (/billed the most|top supplier|which compan|spend/.test(lower)) {
    const invoices = documents
      .filter((doc) => doc.documentType === "invoice" && doc.metadata?.amount)
      .sort((a, b) => (b.metadata?.amount ?? 0) - (a.metadata?.amount ?? 0))
      .slice(0, 5);
    return {
      content: `Clasificând furnizorii după totalul facturat, Umbrella Systems este pe primul loc cu 42.959 $ pentru echipamente rack și instalare, urmat de Acme Corporation cu 32.450 $ și Northwind Logistics cu 28.900 $. Sumele în EUR și GBP sunt afișate pe fiecare card în moneda originală, fără conversie.`,
      documents: invoices,
      toolCalls: [
        toolCall(
          "query_metadata",
          "Am interogat metadatele extrase",
          { groupBy: "company", aggregate: "sum(amount)" },
          "Au fost agregate 412 facturi",
        ),
      ],
    };
  }

  if (/summar(ise|ize).*(contract|agreement)/.test(lower)) {
    const contracts = documents.filter((doc) => doc.documentType === "contract");
    return {
      content: `În spațiul de lucru sunt ${contracts.length} acorduri. Contractul-cadru de servicii cu Microsoft este cel mai mare angajament: 24 de luni de la 1 septembrie 2026, cu reînnoire automată și preaviz de 60 de zile, iar răspunderea este plafonată la valoarea onorariilor din anul precedent. NDA-ul cu Vertex durează trei ani, iar DPA-ul cu Stark nu are termen fix — rămâne valabil atât timp cât continuă prelucrarea. Un contract de închiriere este încă în procesare și nu are încă rezumat.`,
      documents: contracts,
      toolCalls: [
        toolCall(
          "search_categories",
          "Am listat categoria Contracte",
          { categoryId: "cat_contracts" },
          `${contracts.length} documente`,
        ),
        toolCall(
          "retrieve_document",
          "Am citit clauzele de termen și reînnoire",
          { fields: ["effectiveDate", "termMonths", "autoRenew"] },
          "Au fost citite 4 documente",
        ),
      ],
    };
  }

  const amountMatch = lower.match(/([$€£]?)\s?([\d,]+)\s?(k)?/);
  const threshold = amountMatch
    ? Number(amountMatch[2].replace(/,/g, "")) * (amountMatch[3] ? 1000 : 1)
    : 25_000;

  if (/invoice/.test(lower)) {
    const invoices = documents
      .filter(
        (doc) =>
          doc.documentType === "invoice" &&
          (doc.metadata?.amount ?? 0) > threshold,
      )
      .sort((a, b) => (b.metadata?.amount ?? 0) - (a.metadata?.amount ?? 0));
    const chosen = invoices.length
      ? invoices
      : documents.filter((doc) => mockAnswerDocumentIds.includes(doc.id));

    return {
      content: `Am găsit ${chosen.length} ${chosen.length === 1 ? "factură" : "facturi"} peste ${amountMatch?.[1] || "$"}${threshold.toLocaleString()}. Sunt listate mai jos, în ordine descrescătoare, cu compania, totalul în moneda originală și data emiterii, preluate din metadatele extrase, nu din numele fișierului.`,
      documents: chosen,
      toolCalls: [
        toolCall(
          "search_documents",
          "Am căutat în documente",
          { documentType: "invoice", amountMin: threshold },
          `${chosen.length} din 412 facturi au corespuns`,
        ),
        toolCall(
          "query_metadata",
          "Am citit metadatele extrase",
          { fields: ["amount", "currency", "company", "date"] },
          `Metadate rezolvate pentru ${chosen.length} documente`,
        ),
      ],
    };
  }

  const fallback = documents.slice(0, 3);
  return {
    content: `Iată ce găsesc în colecție legat de asta. Am căutat în ${documents.length} documente, folosind atât cuvinte-cheie, cât și căutare vectorială; cele mai apropiate trei potriviri sunt mai jos. Dacă restrângi întrebarea — după tipul documentului, companie, interval de date sau sumă — îți pot da un răspuns mai precis.`,
    documents: fallback,
    toolCalls: [
      toolCall(
        "search_documents",
        "Am căutat în documente",
        { query: question, mode: "hybrid" },
        `${fallback.length} documente returnate`,
      ),
    ],
  };
}

function toSources(documents: Document[]): ChatSource[] {
  return documents.slice(0, 6).map((doc, index) => ({
    id: uid("src"),
    documentId: doc.id,
    documentName: doc.name,
    snippet:
      doc.aiSummary?.split(/(?<=\.)\s+/)[0] ??
      `${doc.name} — procesarea nu a generat încă un rezumat.`,
    score: Number((0.96 - index * 0.03).toFixed(2)),
    page: doc.metadata?.fields?.[0]?.page,
  }));
}

function titleFrom(question: string): string {
  const trimmed = question.trim().replace(/\s+/g, " ");
  return trimmed.length > 48 ? `${trimmed.slice(0, 47)}…` : trimmed;
}

/* ------------------------------------------------------------------ */
/*  Public service                                                     */
/* ------------------------------------------------------------------ */

export const chatApi = {
  /** GET /chat/conversations */
  async listConversations(): Promise<ChatConversation[]> {
    if (!config.useMockApi)
      return http.get<ChatConversation[]>("/chat/conversations");
    await mockLatency(180, 380);
    return [...mockStore.conversations].sort(
      (a, b) =>
        Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  },

  /** GET /chat/conversations/:id/messages */
  async listMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!config.useMockApi)
      return http.get<ChatMessage[]>(
        `/chat/conversations/${conversationId}/messages`,
      );

    await mockLatency(180, 400);
    const messages = mockStore.messages[conversationId] ?? [];
    // Seeded answers reference documents by id so the store stays the single
    // source of truth for document content.
    return messages.map((message) =>
      message.role === "assistant" && !message.documents
        ? {
            ...message,
            documents: mockStore.documents
              .filter((doc) =>
                message.sources?.some((source) => source.documentId === doc.id),
              )
              .map((doc) => ({ document: doc })),
          }
        : message,
    );
  },

  /** POST /chat/conversations */
  async createConversation(title = "Conversație nouă"): Promise<ChatConversation> {
    if (!config.useMockApi)
      return http.post<ChatConversation>("/chat/conversations", { title });

    await mockLatency(160, 320);
    const conversation: ChatConversation = {
      id: uid("conv"),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
    mockStore.conversations = [conversation, ...mockStore.conversations];
    mockStore.messages[conversation.id] = [];
    return conversation;
  },

  /** DELETE /chat/conversations/:id */
  async deleteConversation(id: string): Promise<void> {
    if (!config.useMockApi) {
      await http.delete(`/chat/conversations/${id}`);
      return;
    }
    await mockLatency(160, 320);
    mockStore.conversations = mockStore.conversations.filter(
      (conversation) => conversation.id !== id,
    );
    delete mockStore.messages[id];
  },

  /** POST /chat/conversations/:id/rename */
  async renameConversation(id: string, title: string): Promise<ChatConversation> {
    if (!config.useMockApi)
      return http.put<ChatConversation>(`/chat/conversations/${id}`, { title });

    await mockLatency(140, 260);
    const index = mockStore.conversations.findIndex(
      (conversation) => conversation.id === id,
    );
    if (index === -1) throw new ApiError("Conversația nu a fost găsită.", 404);
    const updated = { ...mockStore.conversations[index], title };
    mockStore.conversations[index] = updated;
    return updated;
  },

  /**
   * POST /chat
   *
   * Returns the assistant message once the answer is composed. `onToolCall`
   * mirrors the streaming events the real backend will emit so the UI can show
   * tool activity before the text arrives.
   */
  async sendMessage(
    payload: SendMessagePayload,
    handlers: { onToolCall?: (call: ChatToolCall) => void } = {},
  ): Promise<{ conversationId: string; message: ChatMessage }> {
    if (!config.useMockApi) {
      return http.post<{ conversationId: string; message: ChatMessage }>(
        "/chat",
        payload,
      );
    }

    // The assistant can fail for reasons the UI must handle: the model endpoint
    // is unreachable, the retrieval step times out, the answer is refused. The
    // mock reproduces that at a low rate so the failure path is exercised —
    // and deterministically for any message containing "/fail", which keeps the
    // state testable without waiting for chance.
    const forceFailure = /\/fail\b/i.test(payload.content);
    if (forceFailure || Math.random() < MOCK_FAILURE_RATE) {
      await sleep(600 + Math.random() * 700);
      throw new ApiError(
        "Asistentul nu a putut fi contactat. Întrebarea ta nu a fost trimisă.",
        503,
      );
    }

    let conversationId = payload.conversationId;
    if (!conversationId) {
      const conversation = await chatApi.createConversation(
        titleFrom(payload.content),
      );
      conversationId = conversation.id;
    }

    const userMessage: ChatMessage = {
      id: uid("msg"),
      conversationId,
      role: "user",
      content: payload.content,
      createdAt: new Date().toISOString(),
      status: "complete",
    };
    mockStore.messages[conversationId] = [
      ...(mockStore.messages[conversationId] ?? []),
      userMessage,
    ];

    const plan = planAnswer(payload.content);

    for (const call of plan.toolCalls) {
      await sleep(260 + Math.random() * 340);
      handlers.onToolCall?.(call);
    }
    await sleep(400 + Math.random() * 600);

    const assistantMessage: ChatMessage = {
      id: uid("msg"),
      conversationId,
      role: "assistant",
      content: plan.content,
      createdAt: new Date().toISOString(),
      status: "complete",
      toolCalls: plan.toolCalls,
      documents: plan.documents.map((document) => ({ document })),
      sources: toSources(plan.documents),
      feedback: null,
    };

    mockStore.messages[conversationId] = [
      ...mockStore.messages[conversationId],
      assistantMessage,
    ];

    const index = mockStore.conversations.findIndex(
      (conversation) => conversation.id === conversationId,
    );
    if (index !== -1) {
      mockStore.conversations[index] = {
        ...mockStore.conversations[index],
        updatedAt: new Date().toISOString(),
        messageCount: mockStore.messages[conversationId].length,
        preview: plan.content.slice(0, 90),
      };
    }

    return { conversationId, message: assistantMessage };
  },

  /** POST /chat/messages/:id/feedback */
  async sendFeedback(
    conversationId: string,
    messageId: string,
    feedback: "up" | "down" | null,
  ): Promise<void> {
    if (!config.useMockApi) {
      await http.post(`/chat/messages/${messageId}/feedback`, { feedback });
      return;
    }
    await mockLatency(120, 240);
    mockStore.messages[conversationId] = (
      mockStore.messages[conversationId] ?? []
    ).map((message) =>
      message.id === messageId ? { ...message, feedback } : message,
    );
  },

  /** GET /chat/tools — the MCP tool surface exposed to the assistant. */
  async listTools(): Promise<AITool[]> {
    if (!config.useMockApi) return http.get<AITool[]>("/chat/tools");
    await mockLatency(120, 240);
    return mockAITools;
  },
};
