import { Outlet } from "react-router-dom";
import { Brand } from "./brand";
import { DocumentShowcase } from "@/components/landing/document-showcase";

/** The product in five words. One line, not five paragraphs. */
const flow = ["Încarcă", "Citește", "Extrage", "Indexează", "Întreabă"];

/**
 * The shell behind login, register and password reset.
 *
 * Left states the promise once and proves it with a single product moment;
 * right holds the only action on the page, on its own surface so it does not
 * float in the void.
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-[92rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(23rem,27rem)]">
        {/* ---------------------------------------------------------------- */}
        {/*  The case for the product                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative hidden min-w-0 overflow-hidden px-10 py-10 lg:block xl:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/4 size-[34rem] rounded-full bg-primary/10 blur-[130px]"
          />

          <div className="relative mx-auto flex h-full w-full max-w-[36rem] flex-col justify-between">
          <Brand />

          <div className="my-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-bright">
              Inteligență documentară
            </p>

            <h1 className="mt-4 max-w-xl text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.045em] xl:text-[3.1rem]">
              Fiecare document,
              <br />
              <span className="text-gradient">citit și indexat.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-muted-foreground">
              Încarcă facturi, contracte și scanări. DocuAI le citește, extrage ce
              contează și îți răspunde cu sursa la vedere.
            </p>

            <DocumentShowcase className="mt-10" />
          </div>

          <div className="space-y-6">
            <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {flow.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  {index > 0 && (
                    <span className="text-[11px] text-border-strong" aria-hidden>
                      —
                    </span>
                  )}
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <p className="text-[11.5px] text-subtle-foreground">
              Practică Tehnologică · prototip frontend · backend simulat
            </p>
          </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  The only action on the page                                     */}
        {/* ---------------------------------------------------------------- */}
        <main className="relative flex flex-col justify-center overflow-hidden px-6 py-12 sm:px-10 lg:px-8">
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-1/2 hidden size-[26rem] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/8 blur-[120px] lg:block"
          />

          <div className="relative mx-auto w-full max-w-[25rem] animate-rise">
            <div className="mb-8 lg:hidden">
              <Brand />
            </div>

            <div className="rounded-card border border-border bg-surface p-6 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.9)] sm:p-7">
              <Outlet />
            </div>

            <p className="mt-4 px-1 text-[11.5px] leading-relaxed text-subtle-foreground">
              Versiune prototip — autentificarea este simulată și nu creează un
              cont real. Datele introduse nu părăsesc acest browser.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
