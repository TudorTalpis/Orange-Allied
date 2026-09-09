import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { Check, FileText, Quote, Search } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/* ------------------------------------------------------------------ */
/*  Mock document                                                      */
/*  Prototype data. The backend does not exist yet, so these values    */
/*  are fixed rather than fetched — they only have to be plausible     */
/*  and internally consistent.                                         */
/* ------------------------------------------------------------------ */

const DOCUMENT = {
  name: "invoice_2026.pdf",
  meta: "PDF · 2,4 MB · 1 pagină",
};

/** Right-hand panel. `step` is the sequence step at which the row appears. */
const EXTRACTED = [
  { label: "Tip document", value: "Factură", step: 3 },
  { label: "Furnizor", value: "Acme SRL", step: 4 },
  { label: "Număr factură", value: "INV-2026-081", step: 4 },
  { label: "Total", value: formatCurrency(2880, "EUR"), step: 4 },
  { label: "Scadență", value: "30 sep. 2026", step: 4 },
];

/** Bottom rail. `step` is the sequence step at which the stage completes. */
const STAGES = [
  { label: "OCR", step: 2 },
  { label: "Clasificare", step: 3 },
  { label: "Extragere", step: 4 },
  { label: "Validare", step: 5 },
  { label: "Indexare", step: 6 },
];

/** Milliseconds spent on each step before advancing to the next one. */
const TIMINGS = [500, 1100, 550, 650, 700, 550, 700, 1000, 0];
const LAST_STEP = TIMINGS.length - 1;

/* ------------------------------------------------------------------ */

/**
 * The hero centrepiece: one invoice moving through DocuAI, from upload to a
 * cited answer.
 *
 * Everything here is presentational — no service call, no data that outlives
 * the component. The sequence runs once when the card scrolls into view and
 * then holds its final state, so the page settles instead of looping.
 */
export function PipelinePreview({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const step = useSequence(inView, reduceMotion);

  return (
    <div
      ref={ref}
      className={cn(
        "w-full overflow-hidden rounded-card border border-border bg-surface shadow-[0_40px_90px_-60px_rgba(0,0,0,1)]",
        className,
      )}
    >
      {/* ------------------------------------------------ File header */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary-border bg-primary-subtle text-brand-bright">
          <FileText className="size-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-mono text-[12.5px] text-foreground">
            {DOCUMENT.name}
          </span>
          <span className="block text-[11px] text-muted-foreground">
            {DOCUMENT.meta}
          </span>
        </span>
        <StatusPill done={step >= 6} />
      </header>

      {/* ------------------------------------------------ Page + fields */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="border-b border-border p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <PaneLabel>Document</PaneLabel>
          <DocumentPage step={step} reduceMotion={reduceMotion} />
        </div>

        <div className="p-4 sm:p-5">
          <PaneLabel>Date extrase</PaneLabel>
          <dl className="mt-3 divide-y divide-border/70">
            {EXTRACTED.map((field, index) => (
              <Reveal
                key={field.label}
                show={step >= field.step}
                delay={field.step === 4 ? index * 0.09 : 0}
                reduceMotion={reduceMotion}
                className="flex items-baseline justify-between gap-4 py-2.5"
              >
                <dt className="text-[12px] text-muted-foreground">{field.label}</dt>
                <dd className="text-right text-[13px] font-medium tabular-nums">
                  {field.value}
                </dd>
              </Reveal>
            ))}
          </dl>
          <Reveal
            show={step >= 5}
            reduceMotion={reduceMotion}
            className="mt-3 border-t border-border pt-3 text-[11px] leading-4 text-muted-foreground"
          >
            12 câmpuri extrase · toate peste pragul de încredere
          </Reveal>
        </div>
      </div>

      {/* ------------------------------------------------ Stage rail */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border bg-surface-raised px-4 py-2.5 sm:px-5">
        {STAGES.map((stage) => (
          <Stage
            key={stage.label}
            label={stage.label}
            done={step >= stage.step}
            active={step === stage.step - 1}
          />
        ))}
      </div>

      {/* ------------------------------------------------ Search & ask */}
      <div className="px-4 py-4 sm:px-5">
        <PaneLabel>Caută și întreabă</PaneLabel>
        <Reveal
          show={step >= 7}
          reduceMotion={reduceMotion}
          className="mt-3 flex items-center gap-2.5 rounded-lg border border-border bg-surface-raised px-3 py-2"
        >
          <Search className="size-3.5 shrink-0 text-brand-bright" aria-hidden />
          <span className="truncate text-[12.5px]">
            Ce facturi sunt scadente luna aceasta?
          </span>
        </Reveal>
        <Reveal show={step >= 8} reduceMotion={reduceMotion} className="mt-3">
          <p className="text-[13px] leading-6">
            Trei facturi sunt scadente luna aceasta.
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
            <Quote className="size-3 shrink-0 text-brand-bright" aria-hidden />
            <span className="font-mono">{DOCUMENT.name}</span>
            <span>· pagina 1</span>
          </p>
        </Reveal>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pieces                                                             */
/* ------------------------------------------------------------------ */

function PaneLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-subtle-foreground">
      {children}
    </p>
  );
}

function StatusPill({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "ml-auto flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors duration-500",
        done
          ? "border-success-border bg-success-muted text-success"
          : "border-border bg-surface-raised text-muted-foreground",
      )}
    >
      {done ? (
        <Check className="size-3" aria-hidden />
      ) : (
        <span
          className="size-1.5 animate-pulse-soft rounded-full bg-brand-bright"
          aria-hidden
        />
      )}
      {done ? "Indexat" : "Se procesează"}
    </span>
  );
}

function Stage({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-[11.5px] transition-colors duration-500",
        done || active ? "text-foreground" : "text-subtle-foreground",
      )}
    >
      {done ? (
        <Check className="size-3 text-success" aria-hidden />
      ) : (
        <span
          className={cn(
            "size-1.5 rounded-full",
            active ? "animate-pulse-soft bg-brand-bright" : "bg-border-strong",
          )}
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}

/**
 * A wireframe of the uploaded page. The bars stand in for text; the four
 * regions DocuAI reads are ringed as their values land in the panel beside it.
 */
function DocumentPage({
  step,
  reduceMotion,
}: {
  step: number;
  reduceMotion: boolean;
}) {
  return (
    <div className="relative mt-3 overflow-hidden rounded-lg border border-border bg-canvas p-4 sm:p-5">
      {/* OCR sweep — a single pass, then gone. */}
      {!reduceMotion && step === 1 && (
        <motion.div
          aria-hidden
          initial={{ y: "-30%", opacity: 0 }}
          animate={{ y: "130%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-x-0 h-14 bg-gradient-to-b from-transparent via-brand-bright/20 to-transparent"
        />
      )}

      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <Region label="Furnizor" w="62%" show={step >= 4}>
            <Bar w="100%" tone="strong" h="h-2.5" />
          </Region>
          <Bar w="38%" />
          <Bar w="30%" />
        </div>
        <div className="w-[38%] shrink-0 space-y-2">
          <Bar w="70%" tone="strong" align="right" />
          <Region label="Nr." w="85%" show={step >= 4} align="right">
            <Bar w="100%" />
          </Region>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        <Bar w="22%" tone="strong" />
        {[92, 86, 94, 78].map((width) => (
          <div key={width} className="flex items-center gap-3">
            <Bar w={`${width * 0.55}%`} />
            <Bar w="14%" className="ml-auto" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-end justify-between gap-6 border-t border-border/70 pt-5">
        <div className="min-w-0 flex-1">
          <Region label="Scadență" w="46%" show={step >= 4}>
            <Bar w="100%" />
          </Region>
        </div>
        <div className="w-[38%] shrink-0">
          <Region label="Total" w="60%" show={step >= 4} align="right">
            <Bar w="100%" tone="strong" h="h-3" />
          </Region>
        </div>
      </div>
    </div>
  );
}

/** A ring drawn around a region of the page once DocuAI has read it. */
function Region({
  label,
  w,
  show,
  align = "left",
  children,
}: {
  label: string;
  w: string;
  show: boolean;
  align?: "left" | "right";
  children: ReactNode;
}) {
  return (
    <span
      className={cn("relative block", align === "right" && "ml-auto")}
      style={{ width: w }}
    >
      {children}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="pointer-events-none absolute -inset-x-1.5 -inset-y-1 rounded border border-brand-bright/55 bg-primary/10"
      >
        <span
          className={cn(
            "absolute -top-[7px] bg-canvas px-1 text-[8.5px] uppercase tracking-[0.1em] text-brand-bright",
            align === "right" ? "right-1" : "left-1",
          )}
        >
          {label}
        </span>
      </motion.span>
    </span>
  );
}

function Bar({
  w,
  h = "h-2",
  tone = "muted",
  align = "left",
  className,
}: {
  w: string;
  h?: string;
  tone?: "muted" | "strong";
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block rounded-full",
        h,
        tone === "strong" ? "bg-foreground/22" : "bg-foreground/10",
        align === "right" && "ml-auto",
        className,
      )}
      style={{ width: w }}
    />
  );
}

function Reveal({
  show,
  delay = 0,
  reduceMotion,
  className,
  children,
}: {
  show: boolean;
  delay?: number;
  reduceMotion: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={false}
      animate={
        reduceMotion
          ? { opacity: show ? 1 : 0 }
          : { opacity: show ? 1 : 0, y: show ? 0 : 6 }
      }
      transition={{ duration: 0.35, ease: "easeOut", delay: show ? delay : 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Walks the preview through its steps once. Reduced motion skips straight to
 * the finished state — the information is the point, the animation is not.
 */
function useSequence(enabled: boolean, reduceMotion: boolean): number {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setStep(LAST_STEP);
      return;
    }
    if (!enabled || step >= LAST_STEP) return;
    const id = window.setTimeout(
      () => setStep((current) => current + 1),
      TIMINGS[step],
    );
    return () => window.clearTimeout(id);
  }, [enabled, reduceMotion, step]);

  return step;
}
