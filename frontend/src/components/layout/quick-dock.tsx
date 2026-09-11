import { useLocation } from "react-router-dom";
import { Bot, FolderTree, Search, Upload, Workflow } from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

/**
 * A floating bar of the actions people reach for repeatedly, available from
 * every screen in the app. Deliberately small: five destinations, each one a
 * real link, with the current page marked.
 */
/**
 * Routes that own their own bottom edge — the chat composer and the settings
 * save bar both sit there, and a floating dock on top of either would cover a
 * control the user is actively using.
 */
const routesWithoutDock = ["/chat", "/settings"];

const actions = [
  { to: "/upload", label: "Încarcă", icon: Upload },
  { to: "/search", label: "Caută", icon: Search },
  { to: "/chat", label: "Asistent", icon: Bot },
  { to: "/documents", label: "Documente", icon: FolderTree },
  { to: "/processing", label: "Procesare", icon: Workflow },
];

export default function QuickDock() {
  const { pathname } = useLocation();

  if (routesWithoutDock.some((route) => pathname.startsWith(route))) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 hidden justify-center px-4 md:flex">
      <div className="pointer-events-auto">
        <Dock label="Acțiuni rapide">
          {actions.map((action) => (
            <DockItem
              key={action.to}
              to={action.to}
              active={pathname.startsWith(action.to)}
            >
              <DockLabel>{action.label}</DockLabel>
              <DockIcon>
                <action.icon className="size-full" aria-hidden />
              </DockIcon>
              <span className="sr-only">{action.label}</span>
            </DockItem>
          ))}
        </Dock>
      </div>
    </div>
  );
}
