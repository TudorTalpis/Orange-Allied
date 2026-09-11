import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Brand } from "@/components/layout/brand";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { cn } from "@/lib/utils";
import { landingSections, observedSections } from "./landing-nav";

/**
 * Tracks which section is in view so the anchor nav reflects the reader's
 * position. An observer is used rather than scroll maths so the highlight stays
 * correct when sections have different heights.
 */
function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = observedSections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => node !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      // A band across the middle of the viewport: a section counts as "current"
      // once it dominates the reading area, not when it first peeks in.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return active;
}

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-200",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      {/*
        Three tracks with equal outer columns, so the section links land on the
        true centre of the bar rather than wherever the brand happens to end.
        The tagline stays out of the bar entirely — it made the left group twice
        as wide as the right one and pushed the links into the logo.
      */}
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 sm:px-8">
        <a
          href="#top"
          className="justify-self-start rounded-lg"
          aria-label="DocuAI, început de pagină"
        >
          <Brand compact />
        </a>

        {/*
          The same dock used for the app's quick actions, with its height
          animation off so the bar cannot jump on hover. Labels appear on hover
          and on keyboard focus, which is what makes an icon-only nav usable.
        */}
        <nav aria-label="Secțiunile paginii" className="hidden lg:block">
          <Dock
            label="Secțiunile paginii"
            animateHeight={false}
            panelHeight={44}
            itemSize={34}
            magnification={50}
            distance={110}
            className="border-transparent bg-transparent shadow-none backdrop-blur-none"
          >
            {landingSections.map((section) => (
              <DockItem
                key={section.id}
                href={section.href}
                active={active === section.id}
              >
                <DockLabel>{section.label}</DockLabel>
                <DockIcon>
                  <section.icon className="size-full" aria-hidden />
                </DockIcon>
                <span className="sr-only">{section.label}</span>
              </DockItem>
            ))}
          </Dock>
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/login">Autentificare</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link to="/register">Creează cont</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Deschide meniul"
          >
            <Menu />
          </Button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="p-0">
          <SheetTitle className="sr-only">Meniu</SheetTitle>
          <div className="border-b border-border p-4">
            <Brand />
          </div>
          <nav aria-label="Secțiunile paginii" className="p-2">
            <ul className="space-y-0.5">
              {landingSections.map((section) => (
                <li key={section.id}>
                  <SheetClose asChild>
                    <a
                      href={section.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
                    >
                      <section.icon className="size-4 shrink-0" aria-hidden />
                      {section.label}
                    </a>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto space-y-2 border-t border-border p-4">
            <Button variant="secondary" asChild className="w-full">
              <Link to="/login">Autentificare</Link>
            </Button>
            <Button variant="primary" asChild className="w-full">
              <Link to="/register">Creează cont</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
