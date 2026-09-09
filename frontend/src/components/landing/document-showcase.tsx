import { Check, FileText, Quote, ScanLine, Search, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { label: "OCR", detail: "Text recuperat", icon: ScanLine },
  { label: "Clasificare", detail: "Factură", icon: Tags },
  { label: "Extragere", detail: "12 câmpuri găsite", icon: FileText },
];

/**
 * One document moving through the product, in a single card.
 *
 * Shared by the landing hero and the auth screens so the promise is shown the
 * same way in both places rather than described twice.
 */
export function DocumentShowcase({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "w-full overflow-hidden rounded-card border border-border bg-surface-raised shadow-[0_30px_80px_-50px_rgba(0,0,0,1)]",
        className,
      )}
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-lg border border-primary-border bg-primary-subtle text-brand-bright">
          <FileText className="size-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-medium">
            invoice_2026.pdf
          </span>
          <span className="block text-[11px] text-muted-foreground">
            Încărcat · PDF · 2,4 MB
          </span>
        </span>
        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary-muted text-brand-bright">
          <Check className="size-3" aria-hidden />
        </span>
      </header>

      <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.8fr)]">
        <div className="divide-y divide-border">
          <p className="px-4 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-subtle-foreground">
            DocuAI îl înțelege
          </p>
          {stages.map(({ label, detail, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2.5 px-4 py-2.5">
              <Icon className="size-3.5 shrink-0 text-brand-bright" aria-hidden />
              <span className="text-[12px]">{label}</span>
              <span className="ml-auto truncate text-[11px] text-muted-foreground">
                {detail}
              </span>
              <Check className="size-3 shrink-0 text-success" aria-hidden />
            </div>
          ))}
        </div>

        <div className="border-t border-border px-4 py-3 sm:border-l sm:border-t-0">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Search className="size-3 text-brand-bright" aria-hidden />
            Caută și întreabă
          </p>
          <p className="mt-2 text-[12px] leading-5">
            Ce facturi sunt scadente luna aceasta?
          </p>
          <p className="mt-2 border-t border-border pt-2 text-[11px] leading-4 text-muted-foreground">
            Trei facturi sunt scadente luna aceasta.
          </p>
          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-4 text-muted-foreground">
            <Quote className="mt-0.5 size-3 shrink-0 text-brand-bright" aria-hidden />
            Răspuns citat din invoice_2026.pdf
          </p>
        </div>
      </div>
    </article>
  );
}
