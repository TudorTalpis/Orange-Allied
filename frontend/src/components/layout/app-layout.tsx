import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { processingApi } from "@/api";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { SidebarContent } from "./sidebar";

// Lazily loaded so framer-motion stays out of the public landing bundle.
const QuickDock = lazy(() => import("./quick-dock"));

const COLLAPSE_KEY = "docuai.sidebar-collapsed";

/**
 * The application shell: a persistent sidebar on desktop, a drawer on mobile,
 * and a sticky header. Pages render into the outlet.
 */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(COLLAPSE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    processingApi
      .stats()
      .then((stats) => setActiveJobCount(stats.activeJobs + stats.queuedJobs))
      .catch(() => setActiveJobCount(0));
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Sari la conținut
      </a>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border transition-[width] duration-200 lg:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent collapsed={collapsed} activeJobCount={activeJobCount} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Navigare</SheetTitle>
          <SidebarContent
            collapsed={false}
            activeJobCount={activeJobCount}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-16" : "lg:pl-64",
        )}
      >
        <Header
          onOpenMobileNav={() => setMobileOpen(true)}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
        />
        <main
          id="main-content"
          className="flex-1 animate-fade-in px-4 py-6 md:pb-28 lg:px-8 lg:py-8 lg:pb-28"
        >
          <Outlet />
        </main>

        <Suspense fallback={null}>
          <QuickDock />
        </Suspense>
      </div>
    </div>
  );
}
