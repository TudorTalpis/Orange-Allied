import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  FolderTree,
  Layers,
  SearchCheck,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { PipelinePreview } from "@/components/landing/pipeline-preview";
import { ProcessFlow } from "@/components/landing/process-flow";

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/*  Kept beside the page rather than inside the markup, so the copy is  */
/*  editable without touching layout.                                   */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: SearchCheck,
    title: "Căutare pe înțeles, nu doar pe cuvinte",
    body: "Caută exact, caută semantic sau ambele deodată. Interogarea în limbaj natural este tradusă în filtre pe care le vezi înainte de rezultate.",
  },
  {
    icon: Bot,
    title: "Asistent care își arată sursele",
    body: "Răspunde doar din documentele tale și citează fișierul și pagina de unde a luat fiecare valoare. Fără surse, fără răspuns.",
  },
  {
    icon: Workflow,
    title: "Procesare vizibilă, etapă cu etapă",
    body: "Vezi unde se află fiecare document în flux, ce a produs fiecare etapă și ce poți relua când ceva eșuează.",
  },
  {
    icon: FolderTree,
    title: "Organizare care ține pasul",
    body: "Categorii proprii, mutare în lot și filtre pe companie, monedă, sumă, dată sau stare de procesare.",
  },
  {
    icon: Layers,
    title: "Metadate potrivite fiecărui tip",
    body: "O factură are furnizor și scadență, un contract are durată și reînnoire. Modelul de date nu forțează totul într-un singur tipar.",
  },
  {
    icon: ShieldCheck,
    title: "Procesare locală sau în cloud",
    body: "Alegi unde rulează inferența. Modul local păstrează fiecare document pe propria infrastructură.",
  },
];

const faq = [
  {
    question: "Ce formate de fișiere acceptă?",
    answer:
      "PDF, JPG, JPEG, PNG și DOCX, până la 50 MB per fișier. Poți încărca mai multe deodată, iar fiecare intră separat în flux.",
  },
  {
    question: "Ce înseamnă că backendul este simulat?",
    answer:
      "Aceasta este partea de frontend a unui proiect de Practică Tehnologică. Interfața este completă și funcțională, dar OCR-ul, clasificarea, extragerea și asistentul sunt simulate în browser. Stratul de servicii are deja forma API-ului real, astfel încât conectarea la un backend FastAPI să nu ceară rescrierea interfeței.",
  },
  {
    question: "Datele mele pleacă undeva?",
    answer:
      "Nu. În versiunea de prototip nimic nu părăsește browserul: documentele încărcate rămân în memoria filei și în stocarea locală, iar la reîmprospătare se păstrează doar metadatele, nu și fișierele.",
  },
  {
    question: "Cum știu că informația extrasă este corectă?",
    answer:
      "Fiecare câmp extras vine cu un nivel de încredere, iar cele sub pragul configurat sunt marcate explicit pentru verificare. Poți vedea și textul brut recunoscut de OCR, ca să compari cu originalul.",
  },
  {
    question: "Ce se întâmplă când procesarea eșuează?",
    answer:
      "Documentul rămâne în listă cu starea și etapa la care s-a oprit, împreună cu motivul. Poți relua procesarea din pagina de procesare sau direct din coada de încărcare.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-background">
      <LandingHeader />

      <main>
        {/* -------------------------------------------------- Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 size-[46rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/12 blur-[140px]"
          />

          <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center rounded-full border border-primary-border bg-primary-subtle px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-brand-bright">
                Inteligență documentară
              </p>
              <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[3.9rem] lg:text-[4.35rem]">
                Fiecare document,
                <br />
                <span className="text-gradient">citit și indexat.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-[16px] sm:leading-8">
                Încarcă facturi, contracte și scanări. DocuAI le citește, extrage
                ce contează și îți răspunde cu sursa la vedere.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                <Button variant="primary" size="lg" asChild className="w-full sm:w-auto">
                  <Link to="/register">
                    Începe acum
                    <ArrowRight />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto">
                  <a href="#flux">Vezi cum funcționează</a>
                </Button>
              </div>

              <p className="mt-6 font-mono text-[11px] text-subtle-foreground">
                PDF · JPG · PNG · DOCX · până la 50 MB
              </p>
            </div>

            <PipelinePreview className="mx-auto mt-12 max-w-5xl sm:mt-14" />
          </div>
        </section>

        {/* -------------------------------------------------- Pipeline */}
        <section
          id="flux"
          className="scroll-mt-20 border-t border-border bg-surface/40"
        >
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <SectionHeading
              eyebrow="Fluxul"
              title="De la fișierul încărcat la răspunsul citat"
              body="Șase pași, aceiași pentru un PDF curat și pentru o poză făcută în grabă. Nimic nu se întâmplă într-o cutie neagră — fiecare pas spune ce a produs."
            />

            <ProcessFlow className="mt-14" />
          </div>
        </section>

        {/* -------------------------------------------------- Features */}
        <section id="functionalitati" className="scroll-mt-20 border-t border-border">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <SectionHeading
              eyebrow="Funcționalități"
              title="Un depozit de fișiere știe unde e documentul. DocuAI știe ce scrie în el."
              body="Diferența dintre stocare și înțelegere se vede în ce poți cere aplicației."
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-strong"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface-raised text-brand-bright">
                    <feature.icon className="size-4" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[14.5px] font-semibold leading-snug tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- FAQ */}
        <section
          id="intrebari"
          className="scroll-mt-20 border-t border-border bg-surface/40"
        >
          <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
            <SectionHeading
              eyebrow="Întrebări"
              title="Ce merită clarificat dinainte"
              align="left"
            />

            <Accordion type="single" collapsible className="mt-10">
              {faq.map((entry) => (
                <AccordionItem key={entry.question} value={entry.question}>
                  <AccordionTrigger>{entry.question}</AccordionTrigger>
                  <AccordionContent>{entry.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* -------------------------------------------------- Closing */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <div className="relative overflow-hidden rounded-card border border-primary-border p-10 text-center surface-gradient">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[110px]"
              />
              <div className="relative">
                <h2 className="text-[1.75rem] font-semibold tracking-tight sm:text-[2rem]">
                  Încarcă primul document
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                  Contul se creează în câteva secunde, iar fluxul complet poate fi
                  parcurs imediat — fără backend, fără configurare.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                  <Button variant="primary" size="lg" asChild className="w-full sm:w-auto">
                    <Link to="/register">
                      Creează cont
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" asChild className="w-full sm:w-auto">
                    <Link to="/login">Am deja cont</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-bright">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-[1.6rem] font-semibold leading-tight tracking-tight sm:text-[2rem]">
        {title}
      </h2>
      {body && (
        <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground">
          {body}
        </p>
      )}
    </div>
  );
}
