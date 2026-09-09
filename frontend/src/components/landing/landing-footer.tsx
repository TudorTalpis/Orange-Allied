import { Link } from "react-router-dom";
import { Brand } from "@/components/layout/brand";
import { landingSections } from "./landing-nav";

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs space-y-3">
            <Brand compact />
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              Platformă de procesare și regăsire inteligentă a documentelor,
              construită ca proiect de Practică Tehnologică.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle-foreground">
                Pagina
              </p>
              <ul className="mt-3 space-y-2">
                {landingSections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={section.href}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle-foreground">
                Cont
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    to="/login"
                    className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Autentificare
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Creează cont
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-[11.5px] text-subtle-foreground">
          Practică Tehnologică · prototip frontend · backendul, OCR-ul și modelele
          sunt simulate
        </p>
      </div>
    </footer>
  );
}
