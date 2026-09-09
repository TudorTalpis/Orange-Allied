import { Link } from "react-router-dom";
import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { primaryNav, secondaryNav } from "./nav-config";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  activeJobCount: number;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarContent({
  collapsed,
  activeJobCount,
  onNavigate,
  className,
}: SidebarProps) {
  return (
    <div className={cn("flex h-full flex-col surface-gradient", className)}>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="rounded-lg"
          aria-label="Pagina principală DocuAI"
        >
          <Brand collapsed={collapsed} />
        </Link>
      </div>

      <nav
        aria-label="Navigare principală"
        className={cn("flex-1 overflow-y-auto px-3 py-4", collapsed && "px-2")}
      >
        {!collapsed && (
          <p className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle-foreground">
            Spațiu de lucru
          </p>
        )}
        <SidebarNav
          items={primaryNav}
          collapsed={collapsed}
          activeJobCount={activeJobCount}
          onNavigate={onNavigate}
        />

        <Separator className="my-4" />

        {!collapsed && (
          <p className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle-foreground">
            Cont
          </p>
        )}
        <SidebarNav
          items={secondaryNav}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />

      </nav>

      <div className={cn("shrink-0 border-t border-border p-2", collapsed && "p-2")}>
        <UserMenu variant="sidebar" collapsed={collapsed} />
      </div>
    </div>
  );
}
