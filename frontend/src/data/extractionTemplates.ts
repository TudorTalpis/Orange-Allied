import type { DocumentKind, ExtractedField } from "@/types";

/**
 * Templates the mock extraction service draws on.
 *
 * They exist so that no UI component ever contains business data: the shape a
 * document class produces is described here once, and the service turns it into
 * the generic `ExtractedField[]` every screen already knows how to render.
 * When the backend arrives this file is simply no longer imported.
 */

/** Deterministic pseudo-random from a string, so the same file always extracts
 *  the same values — a demo that changes numbers on every re-upload is worse
 *  than one that is merely fabricated. */
export function seedFrom(input: string): () => number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash += 0x6d2b79f5;
    let t = hash;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const suppliers = [
  { name: "Acme SRL", address: "Str. Fabricii 12, Cluj-Napoca, România", vat: "RO18422031" },
  { name: "Tech Solutions SRL", address: "Str. Aurel Vlaicu 12, Cluj-Napoca, România", vat: "RO38921144" },
  { name: "Northwind Logistics", address: "Bd. Timișoara 44, București, România", vat: "RO21908844" },
  { name: "Vertex Analytics BV", address: "Keizersgracht 210, Amsterdam, Țările de Jos", vat: "NL8231.44.912" },
  { name: "Umbrella Systems", address: "Calea Victoriei 88, București, România", vat: "RO40118237" },
] as const;

export const CUSTOMER = "Orange Allied SRL";

/** Maps a filename to a document class. Real classification is a model; this is
 *  a prefix match, which is honest about being a prototype. */
export function classifyByFileName(fileName: string): DocumentKind {
  const name = fileName.toLowerCase();
  const rules: Array<[RegExp, DocumentKind]> = [
    [/^invoice|factur|\binv[-_]/, "invoice"],
    [/^contract|contract|\bmsa\b|\bsow\b|\bnda\b/, "contract"],
    [/^receipt|bon|chitan/, "receipt"],
    [/^policy|polit|asigur|insurance/, "insurance_policy"],
    [/^tax|fiscal|vat|tva|declara/, "tax_document"],
    [/statement|extras/, "bank_statement"],
    [/employ|angajare|cim\b/, "employment_contract"],
    [/report|raport/, "report"],
  ];
  for (const [pattern, kind] of rules) {
    if (pattern.test(name)) return kind;
  }
  return "other";
}

export const kindLabels: Record<DocumentKind, string> = {
  invoice: "Factură",
  contract: "Contract",
  receipt: "Chitanță",
  tax_document: "Document fiscal",
  insurance_policy: "Poliță de asigurare",
  employment_contract: "Contract de muncă",
  bank_statement: "Extras de cont",
  identity_document: "Act de identitate",
  report: "Raport",
  other: "Alt document",
};

/** Which seeded category a freshly classified document belongs in. */
export const kindToCategory: Partial<Record<DocumentKind, string>> = {
  invoice: "cat_invoices",
  contract: "cat_contracts",
  receipt: "cat_receipts",
  tax_document: "cat_tax",
  insurance_policy: "cat_insurance",
  employment_contract: "cat_hr",
  bank_statement: "cat_banking",
  identity_document: "cat_personal",
};

export interface ExtractionResult {
  fields: ExtractedField[];
  extractedText: string;
  summary: string;
  tags: string[];
  /** Values lifted into the normalised metadata block. */
  normalised: {
    company?: string;
    customer?: string;
    invoiceNumber?: string;
    date?: string;
    dueDate?: string;
    subtotal?: number;
    tax?: number;
    amount?: number;
    currency?: string;
    address?: string;
  };
}

function field(
  key: string,
  label: string,
  value: ExtractedField["value"],
  type: ExtractedField["type"],
  confidence: number,
  extra: Partial<ExtractedField> = {},
): ExtractedField {
  return { key, label, value, type, confidence, ...extra };
}

const money = (rand: () => number, min: number, max: number) =>
  Math.round((min + rand() * (max - min)) / 10) * 10;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const longDate = (value: string) =>
  new Date(value).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* ------------------------------------------------------------------ */
/*  Per-class extraction                                               */
/* ------------------------------------------------------------------ */

/**
 * Recovers a counterparty from the filename — `invoice_acme_2026.pdf` names
 * Acme, and a demo that ignores that reads as random. Falls back to the seeded
 * suppliers when the filename carries no usable name.
 */
export function supplierFromFileName(
  fileName: string,
  rand: () => number,
): { name: string; address: string; vat: string } {
  const stem = fileName.replace(/\.[^.]+$/, "").toLowerCase();
  const noise =
    /^(invoice|factura|factură|contract|receipt|bon|chitanta|chitanță|policy|polita|poliță|insurance|asigurare|tax|fiscal|vat|tva|statement|extras|report|raport|scan|doc|document|final|copy|semnat|signed)$/;

  const token = stem
    .split(/[\s_\-.]+/)
    .find(
      (part) =>
        part.length > 2 && !noise.test(part) && !/^\d+$/.test(part) && !/^\d{4}$/.test(part),
    );

  if (!token) return suppliers[Math.floor(rand() * suppliers.length)];

  const known = suppliers.find((entry) =>
    entry.name.toLowerCase().split(" ")[0] === token,
  );
  if (known) return known;

  const name = `${token.charAt(0).toUpperCase()}${token.slice(1)} SRL`;
  return {
    name,
    address: "Str. Principală 1, București, România",
    vat: `RO${Math.floor(rand() * 9_000_000) + 1_000_000}`,
  };
}

export function extractFor(
  kind: DocumentKind,
  fileName: string,
  pageCount: number,
): ExtractionResult {
  const rand = seedFrom(fileName);
  const supplier = supplierFromFileName(fileName, rand);
  const issued = new Date();
  issued.setDate(issued.getDate() - Math.floor(rand() * 10));
  const due = new Date(issued);
  due.setDate(due.getDate() + 30);

  switch (kind) {
    case "invoice": {
      const subtotal = money(rand, 800, 12_000);
      const vat = Math.round(subtotal * 0.19);
      const total = subtotal + vat;
      const currency = rand() > 0.5 ? "EUR" : "RON";
      const number = `INV-${issued.getFullYear()}-${String(
        Math.floor(rand() * 900) + 100,
      )}`;

      return {
        normalised: {
          company: supplier.name,
          customer: CUSTOMER,
          invoiceNumber: number,
          date: isoDate(issued),
          dueDate: isoDate(due),
          subtotal,
          tax: vat,
          amount: total,
          currency,
          address: supplier.address,
        },
        tags: ["factură", "de plată"],
        summary: `Factură emisă de ${supplier.name} către ${CUSTOMER} pentru servicii profesionale, cu termen de plată de 30 de zile. Totalul de plată este ${total.toLocaleString("ro-RO")} ${currency}, din care ${vat.toLocaleString("ro-RO")} ${currency} reprezintă TVA.`,
        fields: [
          field("invoiceNumber", "Număr factură", number, "text", 0.99, { page: 1 }),
          field("company", "Furnizor", supplier.name, "text", 0.98, { page: 1 }),
          field("customer", "Client", CUSTOMER, "text", 0.97, { page: 1 }),
          field("vatId", "Cod TVA furnizor", supplier.vat, "text", 0.94, { page: 1 }),
          field("date", "Data emiterii", isoDate(issued), "date", 0.98, { page: 1 }),
          field("dueDate", "Data scadenței", isoDate(due), "date", 0.96, { page: 1 }),
          field("subtotal", "Subtotal", subtotal, "currency", 0.97, { currency, page: pageCount }),
          field("tax", "TVA (19%)", vat, "currency", 0.96, { currency, page: pageCount }),
          field("amount", "Total de plată", total, "currency", 0.99, { currency, page: pageCount }),
          field("currency", "Monedă", currency, "text", 0.99),
          field("paymentTerms", "Termen de plată", "30 de zile", "text", 0.92, { page: 1 }),
          field("address", "Adresa furnizorului", supplier.address, "text", 0.9, { page: 1 }),
        ],
        extractedText: [
          "FACTURĂ",
          supplier.name,
          supplier.address,
          `Cod TVA: ${supplier.vat}`,
          "",
          `Factură nr. ${number}`,
          `Data emiterii: ${longDate(isoDate(issued))}`,
          `Data scadenței: ${longDate(isoDate(due))}`,
          "",
          `Client: ${CUSTOMER}`,
          "",
          "Descriere                                    Valoare",
          `Servicii profesionale                        ${Math.round(subtotal * 0.7).toLocaleString("ro-RO")} ${currency}`,
          `Servicii de procesare documente              ${Math.round(subtotal * 0.3).toLocaleString("ro-RO")} ${currency}`,
          "",
          `Subtotal:  ${subtotal.toLocaleString("ro-RO")} ${currency}`,
          `TVA 19%:   ${vat.toLocaleString("ro-RO")} ${currency}`,
          `TOTAL:     ${total.toLocaleString("ro-RO")} ${currency}`,
          "",
          "Termen de plată: 30 de zile de la emitere.",
        ].join("\n"),
      };
    }

    case "contract": {
      const months = [12, 24, 36][Math.floor(rand() * 3)];
      const start = new Date(issued);
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);

      return {
        normalised: {
          company: supplier.name,
          customer: CUSTOMER,
          date: isoDate(start),
          dueDate: isoDate(end),
          address: supplier.address,
        },
        tags: ["contract", "în vigoare"],
        summary: `Contract încheiat între ${CUSTOMER} și ${supplier.name}, cu o durată inițială de ${months} de luni și reînnoire automată în lipsa unei notificări cu 30 de zile înainte de expirare.`,
        fields: [
          field("counterparty", "Parte contractantă", supplier.name, "text", 0.97, { page: 1 }),
          field("customer", "Beneficiar", CUSTOMER, "text", 0.96, { page: 1 }),
          field("agreementType", "Tip de acord", "Contract de prestări servicii", "text", 0.94, { page: 1 }),
          field("effectiveDate", "Data intrării în vigoare", isoDate(start), "date", 0.96, { page: 1 }),
          field("endDate", "Data expirării", isoDate(end), "date", 0.94, { page: 1 }),
          field("termMonths", "Durată (luni)", months, "number", 0.95, { page: 2 }),
          field("autoRenew", "Reînnoire automată", true, "boolean", 0.91, { page: 2 }),
          field("noticePeriodDays", "Preaviz (zile)", 30, "number", 0.9, { page: 2 }),
          field("governingLaw", "Legea aplicabilă", "România", "text", 0.93, { page: pageCount }),
        ],
        extractedText: [
          "CONTRACT DE PRESTĂRI SERVICII",
          "",
          `Încheiat între ${supplier.name}, cu sediul în ${supplier.address},`,
          `și ${CUSTOMER}, denumit în continuare Beneficiar.`,
          "",
          `Art. 1 — Obiectul contractului`,
          "Prestatorul se obligă să furnizeze serviciile descrise în Anexa 1.",
          "",
          "Art. 2 — Durata",
          `Prezentul contract intră în vigoare la ${longDate(isoDate(start))} și`,
          `produce efecte pentru o perioadă de ${months} de luni.`,
          "",
          "Art. 3 — Reînnoire",
          "Contractul se reînnoiește automat în lipsa unei notificări scrise",
          "transmise cu cel puțin 30 de zile înainte de expirare.",
        ].join("\n"),
      };
    }

    case "receipt": {
      const total = money(rand, 40, 900);
      const vat = Math.round(total * 0.19 * 100) / 100;
      return {
        normalised: {
          company: supplier.name,
          date: isoDate(issued),
          amount: total,
          tax: vat,
          currency: "RON",
        },
        tags: ["cheltuială"],
        summary: `Bon fiscal emis de ${supplier.name} în valoare de ${total.toLocaleString("ro-RO")} RON, înregistrat ca și cheltuială operațională.`,
        fields: [
          field("merchant", "Comerciant", supplier.name, "text", 0.93),
          field("date", "Data", isoDate(issued), "date", 0.95),
          field("amount", "Total", total, "currency", 0.94, { currency: "RON" }),
          field("tax", "TVA inclus", vat, "currency", 0.87, { currency: "RON" }),
          field("paymentMethod", "Metodă de plată", "Card ···4417", "text", 0.85),
        ],
        extractedText: [
          supplier.name,
          supplier.address,
          "",
          "BON FISCAL",
          `Data: ${longDate(isoDate(issued))}`,
          "",
          `TOTAL: ${total.toLocaleString("ro-RO")} RON`,
          `din care TVA: ${vat.toLocaleString("ro-RO")} RON`,
          "",
          "Plata efectuată cu card bancar.",
        ].join("\n"),
      };
    }

    case "insurance_policy": {
      const premium = money(rand, 1_200, 9_000);
      const limit = money(rand, 200_000, 2_000_000);
      const end = new Date(issued);
      end.setFullYear(end.getFullYear() + 1);
      return {
        normalised: {
          company: supplier.name,
          date: isoDate(issued),
          dueDate: isoDate(end),
          amount: premium,
          currency: "EUR",
        },
        tags: ["asigurare", "reînnoire"],
        summary: `Poliță de asigurare cu o primă anuală de ${premium.toLocaleString("ro-RO")} EUR și o limită agregată de ${limit.toLocaleString("ro-RO")} EUR, valabilă un an de la emitere.`,
        fields: [
          field("policyNumber", "Număr poliță", `PI-${issued.getFullYear()}-${Math.floor(rand() * 90000) + 10000}`, "text", 0.95, { page: 1 }),
          field("insurer", "Asigurător", supplier.name, "text", 0.96, { page: 1 }),
          field("coverageStart", "Început acoperire", isoDate(issued), "date", 0.94, { page: 1 }),
          field("coverageEnd", "Sfârșit acoperire", isoDate(end), "date", 0.93, { page: 1 }),
          field("premium", "Primă anuală", premium, "currency", 0.9, { currency: "EUR", page: 2 }),
          field("aggregateLimit", "Limită agregată", limit, "currency", 0.66, { currency: "EUR", page: 2, needsReview: true }),
        ],
        extractedText: [
          "POLIȚĂ DE ASIGURARE",
          supplier.name,
          "",
          `Asigurat: ${CUSTOMER}`,
          `Perioada de asigurare: ${longDate(isoDate(issued))} — ${longDate(isoDate(end))}`,
          "",
          `Primă anuală: ${premium.toLocaleString("ro-RO")} EUR`,
          `Limită agregată: ${limit.toLocaleString("ro-RO")} EUR`,
        ].join("\n"),
      };
    }

    default: {
      return {
        normalised: { date: isoDate(issued), company: supplier.name },
        tags: ["neclasificat"],
        summary: `Document încărcat pe ${longDate(isoDate(issued))}. Clasificatorul nu a identificat o clasă cunoscută, așa că au fost extrase doar câmpurile generale.`,
        fields: [
          field("documentDate", "Data documentului", isoDate(issued), "date", 0.88),
          field("issuer", "Emitent", supplier.name, "text", 0.72),
          field("pageCount", "Număr de pagini", pageCount, "number", 0.99),
          field("language", "Limbă detectată", "Română", "text", 0.9),
        ],
        extractedText: [
          supplier.name,
          "",
          `Document din ${longDate(isoDate(issued))}.`,
          "",
          "Conținutul recunoscut nu corespunde unei clase cunoscute de documente.",
          "Textul de mai sus este rezultatul simulat al etapei OCR.",
        ].join("\n"),
      };
    }
  }
}
