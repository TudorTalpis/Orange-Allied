import type { AITool, ChatConversation, ChatMessage } from "@/types";

export const mockConversations: ChatConversation[] = [
  {
    id: "conv_1",
    title: "Facturi de valoare mare 2025–2026",
    createdAt: "2026-09-07T08:12:00.000Z",
    updatedAt: "2026-09-07T08:16:00.000Z",
    messageCount: 4,
    pinned: true,
    preview: "Am găsit 5 facturi peste 25.000 $ în 2025 și 2026.",
  },
  {
    id: "conv_2",
    title: "Obligații GDPR în contracte",
    createdAt: "2026-09-05T14:02:00.000Z",
    updatedAt: "2026-09-05T14:19:00.000Z",
    messageCount: 6,
    preview: "Trei acorduri conțin clauze explicite de prelucrare GDPR.",
  },
  {
    id: "conv_3",
    title: "Ce furnizori au facturat cel mai mult?",
    createdAt: "2026-09-02T10:41:00.000Z",
    updatedAt: "2026-09-02T10:44:00.000Z",
    messageCount: 2,
    preview: "Umbrella Systems conduce cu 42.959 $ pentru o singură achiziție.",
  },
  {
    id: "conv_4",
    title: "Date de reînnoire a asigurărilor",
    createdAt: "2026-08-22T09:10:00.000Z",
    updatedAt: "2026-08-22T09:14:00.000Z",
    messageCount: 4,
    preview: "Polița de răspundere profesională se reînnoiește pe 19 august 2027.",
  },
  {
    id: "conv_5",
    title: "Rezumat poziție TVA pe T2",
    createdAt: "2026-07-26T16:30:00.000Z",
    updatedAt: "2026-07-26T16:33:00.000Z",
    messageCount: 2,
    preview: "TVA-ul net de plată pentru T2 2026 a fost 41.208 RON.",
  },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  conv_1: [
    {
      id: "msg_1",
      conversationId: "conv_1",
      role: "user",
      content:
        "Găsește-mi cinci facturi din 2025–2026 cu un total mai mare de 25.000 $.",
      createdAt: "2026-09-07T08:12:00.000Z",
      status: "complete",
    },
    {
      id: "msg_2",
      conversationId: "conv_1",
      role: "assistant",
      content:
        "Am găsit 5 facturi peste 25.000 $ emise între ianuarie 2025 și septembrie 2026. Sumele în EUR și GBP au fost convertite la cursul înregistrat la data fiecărei facturi, pentru comparație, dar moneda originală este afișată pe fiecare card.",
      createdAt: "2026-09-07T08:12:06.000Z",
      status: "complete",
      toolCalls: [
        {
          id: "tc_1",
          tool: "search_documents",
          label: "Am căutat în documente",
          arguments: {
            documentType: "invoice",
            amountMin: 25000,
            currency: "USD",
            dateFrom: "2025-01-01",
            dateTo: "2026-09-07",
          },
          status: "completed",
          resultSummary: "5 din 412 facturi au corespuns",
          durationMs: 380,
        },
        {
          id: "tc_2",
          tool: "query_metadata",
          label: "Am citit metadatele extrase",
          arguments: { fields: ["amount", "currency", "company", "date"] },
          status: "completed",
          resultSummary: "Metadate rezolvate pentru 5 documente",
          durationMs: 96,
        },
      ],
      sources: [
        {
          id: "src_1",
          documentId: "doc_1044",
          documentName: "Invoice_INV-2026-1044.pdf",
          snippet:
            "Total de plată 42.959,00 USD — rack-uri, switch-uri top-of-rack și manoperă de instalare.",
          score: 0.96,
          page: 3,
        },
        {
          id: "src_2",
          documentId: "doc_1042",
          documentName: "Invoice_INV-2026-1042.pdf",
          snippet:
            "Total 32.450,00 USD pentru licențiere platformă enterprise și suport premium.",
          score: 0.95,
          page: 3,
        },
        {
          id: "src_3",
          documentId: "doc_1037",
          documentName: "Invoice_INV-2026-1037.pdf",
          snippet: "Total 28.900,00 USD — depozitare și distribuție last-mile, iulie 2026.",
          score: 0.92,
          page: 2,
        },
        {
          id: "src_4",
          documentId: "doc_982",
          documentName: "Invoice_INV-2025-982.pdf",
          snippet: "Total 27.251,00 USD — echipamente de laborator și garanție extinsă.",
          score: 0.9,
          page: 2,
        },
        {
          id: "src_5",
          documentId: "doc_1038",
          documentName: "Invoice_INV-2026-1038.pdf",
          snippet: "Total 18.200,00 EUR (≈ 26.100 USD) — 148 de ore de inginerie backend.",
          score: 0.87,
          page: 2,
        },
      ],
    },
  ],
};

/** Document ids the seeded answer above should render as result cards. */
export const mockAnswerDocumentIds: string[] = [
  "doc_1044",
  "doc_1042",
  "doc_1037",
  "doc_982",
  "doc_1038",
];

export const suggestedPrompts: Array<{
  label: string;
  prompt: string;
  icon: string;
}> = [
  {
    label: "Găsește toate facturile peste 10.000 $",
    prompt: "Găsește toate facturile peste 10.000 $ și grupează-le după furnizor.",
    icon: "receipt-text",
  },
  {
    label: "Rezuma contractele mele",
    prompt:
      "Rezumă fiecare contract din spațiul de lucru: contraparte, termen și data reînnoirii.",
    icon: "file-signature",
  },
  {
    label: "Ce companii m-au facturat cel mai mult?",
    prompt: "Ce companii m-au facturat cel mai mult în 2026 și care este totalul?",
    icon: "trending-up",
  },
  {
    label: "Găsește documente care menționează GDPR",
    prompt: "Găsește documente care menționează GDPR și explică obligațiile din fiecare.",
    icon: "shield-check",
  },
];

/**
 * Capabilities exposed to the assistant. In production these are MCP tools
 * served by the backend; the frontend only ever describes and toggles them.
 */
export const mockAITools: AITool[] = [
  {
    id: "tool_search",
    name: "Căutare documente",
    description:
      "Rulează căutare hibridă, pe cuvinte-cheie și vectorială, în toată colecția.",
    icon: "search",
    enabled: true,
    category: "retrieval",
  },
  {
    id: "tool_retrieval",
    name: "Preluare document",
    description:
      "Aduce textul integral și structura pe pagini a unui document anume.",
    icon: "file-text",
    enabled: true,
    category: "retrieval",
  },
  {
    id: "tool_category",
    name: "Căutare pe categorii",
    description: "Listează și filtrează documente dintr-o categorie sau un set de etichete.",
    icon: "folder-tree",
    enabled: true,
    category: "retrieval",
  },
  {
    id: "tool_metadata",
    name: "Interogare metadate",
    description:
      "Interoghează câmpurile extrase — sume, date, companii — folosind operatori.",
    icon: "database",
    enabled: true,
    category: "metadata",
  },
  {
    id: "tool_aggregate",
    name: "Agregare",
    description: "Calculează sume, numărători și medii peste documentele găsite.",
    icon: "sigma",
    enabled: false,
    category: "analysis",
  },
];
