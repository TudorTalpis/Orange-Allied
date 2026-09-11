import type { AppNotification, DeviceSession, User } from "@/types";

export const mockUser: User = {
  id: "usr_1",
  fullName: "Tudor Alpiste",
  email: "tudor@orangeallied.com",
  role: "owner",
  organisation: "Orange Allied SRL",
  jobTitle: "Inginer de service pe teren",
  createdAt: "2025-02-14T08:00:00.000Z",
  lastActiveAt: "2026-09-07T09:05:00.000Z",
};

export const mockSessions: DeviceSession[] = [
  {
    id: "sess_1",
    device: "MacBook Air (M2)",
    browser: "Chrome 141",
    location: "Chișinău, Moldova",
    ipAddress: "89.28.14.—",
    lastActiveAt: "2026-09-07T09:05:00.000Z",
    current: true,
  },
  {
    id: "sess_2",
    device: "iPhone 15",
    browser: "Safari Mobile",
    location: "Chișinău, Moldova",
    ipAddress: "212.19.60.—",
    lastActiveAt: "2026-09-06T21:12:00.000Z",
    current: false,
  },
  {
    id: "sess_3",
    device: "Windows Workstation",
    browser: "Edge 140",
    location: "Cluj-Napoca, România",
    ipAddress: "185.44.22.—",
    lastActiveAt: "2026-09-02T14:38:00.000Z",
    current: false,
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: "ntf_1",
    kind: "processing",
    title: "Procesare finalizată",
    body: "Bank_Statement_August_2026.pdf a trecut prin toate cele șase etape ale fluxului.",
    createdAt: "2026-09-07T09:04:12.000Z",
    read: false,
    href: "/documents/doc_bank_aug",
  },
  {
    id: "ntf_2",
    kind: "processing",
    title: "Procesare eșuată",
    body: "Invoice_INV-2026-1051.pdf a eșuat la etapa OCR și poate fi reluat.",
    createdAt: "2026-09-06T16:31:12.000Z",
    read: false,
    href: "/processing",
  },
  {
    id: "ntf_3",
    kind: "ai",
    title: "2 câmpuri necesită verificare",
    body: "Insurance_Policy_Allianz_2026.pdf are valori cu încredere scăzută pe pagina de anexă.",
    createdAt: "2026-08-21T13:49:02.000Z",
    read: false,
    href: "/documents/doc_insurance",
  },
  {
    id: "ntf_4",
    kind: "system",
    title: "Stocare la 61%",
    body: "Folosești 4,8 GB din cei 8 GB alocați spațiului tău de lucru.",
    createdAt: "2026-09-05T06:00:00.000Z",
    read: true,
    href: "/settings",
  },
  {
    id: "ntf_5",
    kind: "security",
    title: "Autentificare nouă",
    body: "O autentificare nouă din Edge, pe o stație Windows din Cluj-Napoca.",
    createdAt: "2026-09-02T14:38:00.000Z",
    read: true,
    href: "/settings",
  },
];
