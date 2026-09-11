import { Link, useLocation } from "react-router-dom";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { GlobalSearch } from "./global-search";
import { NotificationsMenu } from "./notifications-menu";
import { UserMenu } from "./user-menu";
import { routeTitles } from "./nav-config";

interface HeaderProps {
  onOpenMobileNav: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Extra trailing content contributed by a page, e.g. a detail-page title. */
  breadcrumbTail?: string;
}

function titleFor(pathname: string): string {
  return (
    routeTitles.find((entry) => pathname.startsWith(entry.prefix))?.title ??
    "Prezentare generală"
  );
}

export function Header({
  onOpenMobileNav,
  collapsed,
  onToggleCollapsed,
  breadcrumbTail,
}: HeaderProps) {
  const { pathname } = useLocation();
  const title = titleFor(pathname);
  const section = routeTitles.find((entry) => pathname.startsWith(entry.prefix));

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Deschide navigarea"
      >
        <Menu />
      </Button>

      <Hint label={collapsed ? "Extinde bara laterală" : "Restrânge bara laterală"} side="bottom">
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden lg:inline-flex"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Extinde bara laterală" : "Restrânge bara laterală"}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </Hint>

      <nav aria-label="Navigare ierarhică" className="min-w-0 shrink">
        <ol className="flex items-center gap-1.5 text-[13px]">
          {breadcrumbTail && section ? (
            <>
              <li className="hidden sm:block">
                <Link
                  to={section.prefix}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {title}
                </Link>
              </li>
              <li className="hidden text-subtle-foreground sm:block" aria-hidden>
                /
              </li>
              <li className="min-w-0">
                <span className="block truncate font-medium">{breadcrumbTail}</span>
              </li>
            </>
          ) : (
            <li className="font-medium">{title}</li>
          )}
        </ol>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <GlobalSearch className="hidden md:block md:w-64 lg:w-80" />
        <NotificationsMenu />
        <UserMenu variant="header" />
      </div>
    </header>
  );
}
