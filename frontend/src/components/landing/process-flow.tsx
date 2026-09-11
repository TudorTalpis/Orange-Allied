import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * The six things DocuAI does with a document, in order.
 *
 * Deliberately written without OCR / embeddings / vector wording — those are
 * implementation details, visible inside the product itself, and not the way
 * the product is explained to someone seeing it for the first time.
 */
const steps = [
  { title: "Încărcare", body: "Adaugi facturi, contracte, chitanțe și scanări." },
  { title: "Înțelegere", body: "DocuAI recunoaște documentul și structura lui." },
  { title: "Extragere", body: "Câmpurile care contează sunt citite automat." },
  { title: "Indexare", body: "Documentele devin căutabile." },
  { title: "Căutare", body: "Găsești documentul și informația rapid." },
  { title: "Întreabă", body: "Pui întrebări și primești răspunsuri cu sursa citată." },
];

/**
 * The pipeline as a rail rather than six cards: horizontal from `lg` up,
 * vertical below it. The segments between steps draw themselves once, on
 * entry, so the order is read before the words are.
 */
export function ProcessFlow({ className }: { className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const shown = inView || reduceMotion;

  return (
    <ol ref={ref} className={cn("grid gap-8 lg:grid-cols-6 lg:gap-5", className)}>
      {steps.map((step, index) => {
        const delay = reduceMotion ? 0 : 0.1 + index * 0.1;
        return (
          <motion.li
            key={step.title}
            className="relative pl-9 lg:pl-0"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={shown ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.4, ease: "easeOut", delay }}
          >
            {index < steps.length - 1 && (
              <Connector delay={delay} shown={shown} reduceMotion={reduceMotion} />
            )}

            <span className="absolute left-0 top-0 z-1 flex size-[23px] items-center justify-center rounded-full border border-primary-border bg-primary-subtle font-mono text-[10px] text-brand-bright lg:static lg:mb-4">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-[15px] font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </motion.li>
        );
      })}
    </ol>
  );
}

/**
 * The line running to the next step. Two elements rather than one, because the
 * vertical rail grows downwards and the horizontal one grows to the right, and
 * a single element cannot animate a different axis at each breakpoint.
 */
function Connector({
  delay,
  shown,
  reduceMotion,
}: {
  delay: number;
  shown: boolean;
  reduceMotion: boolean;
}) {
  const transition = { duration: 0.5, ease: "easeOut" as const, delay: delay + 0.15 };

  return (
    <span aria-hidden>
      <motion.span
        className="absolute bottom-[-2.5rem] left-[11px] top-[29px] w-px origin-top bg-border lg:hidden"
        initial={reduceMotion ? false : { scaleY: 0 }}
        animate={shown ? { scaleY: 1 } : undefined}
        transition={transition}
      />
      <motion.span
        className="absolute hidden h-px origin-left bg-border lg:left-[31px] lg:right-[-1.25rem] lg:top-[11px] lg:block"
        initial={reduceMotion ? false : { scaleX: 0 }}
        animate={shown ? { scaleX: 1 } : undefined}
        transition={transition}
      />
    </span>
  );
}
