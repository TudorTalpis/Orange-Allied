import { CircleHelp, House, Layers, Workflow, type LucideIcon } from "lucide-react";

export interface LandingSection {
  id: string;
  label: string;
  /** Anchor target; the first entry points at the top of the page. */
  href: string;
  icon: LucideIcon;
}

/** The sections the public page is made of, in document order. */
export const landingSections: LandingSection[] = [
  { id: "top", label: "Acasă", href: "#top", icon: House },
  { id: "flux", label: "Fluxul", href: "#flux", icon: Workflow },
  { id: "functionalitati", label: "Funcționalități", href: "#functionalitati", icon: Layers },
  { id: "intrebari", label: "Întrebări", href: "#intrebari", icon: CircleHelp },
];

/** Only the real sections are observed for the active-link highlight. */
export const observedSections = landingSections.filter(
  (section) => section.id !== "top",
);
