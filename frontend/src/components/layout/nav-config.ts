import {
  Bot,
  CircleHelp,
  FolderTree,
  LayoutDashboard,
  type LucideIcon,
  Search,
  Settings,
  Upload,
  Files,
  Workflow,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Rendered as a small pill next to the label. */
  badge?: "processing";
  description: string;
}

export const primaryNav: NavItem[] = [
  {
    label: "Prezentare generală",
    to: "/dashboard",
    icon: LayoutDashboard,
    description: "Activitatea spațiului de lucru, pe scurt",
  },
  {
    label: "Documente",
    to: "/documents",
    icon: Files,
    description: "Răsfoiește și organizează colecția",
  },
  {
    label: "Căutare",
    to: "/search",
    icon: Search,
    description: "Căutare după cuvinte-cheie și semantică",
  },
  {
    label: "Asistent AI",
    to: "/chat",
    icon: Bot,
    description: "Pune întrebări despre documentele tale",
  },
  {
    label: "Încărcare",
    to: "/upload",
    icon: Upload,
    description: "Adaugă PDF-uri, fotografii și scanări",
  },
  {
    label: "Procesare",
    to: "/processing",
    icon: Workflow,
    badge: "processing",
    description: "Sarcini OCR, clasificare și extragere",
  },
  {
    label: "Categorii",
    to: "/categories",
    icon: FolderTree,
    description: "Organizează documentele în colecții",
  },
];

export const secondaryNav: NavItem[] = [
  {
    label: "Setări",
    to: "/settings",
    icon: Settings,
    description: "Profil, furnizori AI și procesare",
  },
  {
    label: "Ajutor",
    to: "/help",
    icon: CircleHelp,
    description: "Cum funcționează fluxul de procesare",
  },
];

/** Breadcrumb/page titles keyed by route prefix. */
export const routeTitles: Array<{ prefix: string; title: string }> = [
  { prefix: "/dashboard", title: "Prezentare generală" },
  { prefix: "/documents", title: "Documente" },
  { prefix: "/upload", title: "Încărcare" },
  { prefix: "/search", title: "Căutare" },
  { prefix: "/chat", title: "Asistent AI" },
  { prefix: "/processing", title: "Procesare" },
  { prefix: "/categories", title: "Categorii" },
  { prefix: "/settings", title: "Setări" },
  { prefix: "/help", title: "Ajutor" },
];
