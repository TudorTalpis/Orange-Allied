import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { initials, cn } from "@/lib/utils";

export function UserMenu({
  variant = "sidebar",
  collapsed,
}: {
  variant?: "sidebar" | "header";
  collapsed?: boolean;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const avatar = (
    <Avatar className={variant === "header" ? "size-8" : "size-6"}>
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
      <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Deschide meniul contului"
          className={cn(
            "group flex items-center gap-2.5 rounded-md text-left transition-colors",
            variant === "sidebar" &&
              "w-full px-2 py-1.5 hover:bg-surface-raised data-[state=open]:bg-surface-raised",
            variant === "sidebar" && collapsed && "justify-center bg-transparent p-1",
            variant === "header" && "rounded-full hover:opacity-90",
          )}
        >
          {avatar}
          {variant === "sidebar" && !collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">
                  {user.fullName}
                </span>
                <span className="block truncate text-[11px] text-subtle-foreground">
                  {user.organisation}
                </span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-subtle-foreground transition-transform duration-150 group-data-[state=open]:rotate-180" aria-hidden />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={variant === "header" ? "end" : "start"}
        side={variant === "header" ? "bottom" : "top"}
        className="w-52"
      >
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block text-[13px] font-medium text-foreground">
            {user.fullName}
          </span>
          <span className="block truncate text-[11px] font-normal text-muted-foreground">
            {variant === "sidebar" ? user.organisation : user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <UserRound />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <Settings />
          {variant === "sidebar" ? "Setări" : "Setările spațiului de lucru"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={handleLogout}>
          <LogOut />
          Deconectare
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
