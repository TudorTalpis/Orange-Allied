import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Hint } from "@/components/ui/tooltip";
import type { NavItem } from "./nav-config";

interface SidebarNavProps {
  items: NavItem[];
  collapsed: boolean;
  activeJobCount?: number;
  onNavigate?: () => void;
}

export function SidebarNav({
  items,
  collapsed,
  activeJobCount = 0,
  onNavigate,
}: SidebarNavProps) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const link = (
          <NavLink
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary-subtle text-foreground"
                  : "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator rail */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-1/2 h-4.5 w-0.5 -translate-y-1/2 rounded-r-full transition-opacity",
                    isActive ? "bg-brand-bright opacity-100" : "opacity-0",
                  )}
                />
                <item.icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive ? "text-brand-bright" : "text-subtle-foreground group-hover:text-muted-foreground",
                  )}
                  aria-hidden
                />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.badge === "processing" && activeJobCount > 0 && (
                  <span className="rounded-full border border-warning-border bg-warning-muted px-1.5 py-px font-mono text-[10px] tabular-nums text-warning">
                    {activeJobCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        );

        return (
          <li key={item.to}>
            {collapsed ? (
              <Hint label={item.label} side="right">
                <span className="block">{link}</span>
              </Hint>
            ) : (
              link
            )}
          </li>
        );
      })}
    </ul>
  );
}
