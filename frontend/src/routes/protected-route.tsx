import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/auth-provider";
import { tokenStore } from "@/api/client";
import { Brand } from "@/components/layout/brand";

/** Blocks the app shell until a session is restored, then guards it. */
export function ProtectedRoute() {
  const { user, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Brand />
        <div
          className="h-0.5 w-32 overflow-hidden rounded-full bg-surface-raised"
          role="status"
          aria-label="Se restaurează sesiunea"
        >
          <div className="h-full w-1/2 animate-shimmer brand-gradient" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/**
 * Keeps signed-in users away from the auth screens, returning them to the page
 * that sent them here rather than always to the dashboard.
 */
export function PublicOnlyRoute() {
  const { user, initialising } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  if (initialising) return null;
  if (user) return <Navigate to={from ?? "/dashboard"} replace />;
  return <Outlet />;
}

/**
 * The public landing at "/".
 *
 * A visitor must see the page immediately, so we do not wait on the session
 * restore. A stored token is a synchronous hint that this is a returning user,
 * and only then is the page held back for the moment it takes to confirm — which
 * avoids both a blank flash for visitors and a flash of marketing for members.
 */
export function LandingRoute({ children }: { children: React.ReactNode }) {
  const { user, initialising } = useAuth();
  const hasStoredSession = tokenStore.get() !== null;

  if (user) return <Navigate to="/dashboard" replace />;
  if (initialising && hasStoredSession) return null;

  return <>{children}</>;
}
