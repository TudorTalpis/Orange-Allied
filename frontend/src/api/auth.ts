import { config } from "@/lib/config";
import { mockUser } from "@/data/mockUser";
import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types";
import { ApiError, http, tokenStore } from "./client";
import { mockLatency } from "./mockDelay";

const SESSION_STORAGE_KEY = "docuai.session";

/* ------------------------------------------------------------------ */
/*  Mock implementation                                                */
/*  Deliberately trivial: it must never be mistaken for real security. */
/* ------------------------------------------------------------------ */

function buildMockSession(user: User): AuthSession {
  return {
    user,
    accessToken: `mock.${btoa(user.email)}.${Date.now()}`,
    refreshToken: `mock-refresh.${Date.now()}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
  };
}

function persistSession(session: AuthSession, persist: boolean): void {
  tokenStore.set(session.accessToken, persist);
  try {
    const store = persist ? window.localStorage : window.sessionStorage;
    store.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

function readStoredSession(): AuthSession | null {
  try {
    const raw =
      window.localStorage.getItem(SESSION_STORAGE_KEY) ??
      window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function clearStoredSession(): void {
  tokenStore.clear();
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Public service                                                     */
/* ------------------------------------------------------------------ */

export const authApi = {
  /** POST /auth/login */
  async login(payload: LoginPayload): Promise<AuthSession> {
    if (!config.useMockApi) {
      const session = await http.post<AuthSession>("/auth/login", payload);
      persistSession(session, Boolean(payload.rememberMe));
      return session;
    }

    await mockLatency(500, 900);
    if (!payload.email.includes("@")) {
      throw new ApiError("Introdu o adresă de email validă.", 422);
    }
    if (payload.password.length < 6) {
      throw new ApiError("Email sau parolă incorecte.", 401);
    }

    const session = buildMockSession({ ...mockUser, email: payload.email });
    persistSession(session, Boolean(payload.rememberMe));
    return session;
  },

  /** POST /auth/register */
  async register(payload: RegisterPayload): Promise<AuthSession> {
    if (!config.useMockApi) {
      const session = await http.post<AuthSession>("/auth/register", payload);
      persistSession(session, true);
      return session;
    }

    await mockLatency(600, 1000);
    if (payload.password.length < 8) {
      throw new ApiError("Parola trebuie să aibă cel puțin 8 caractere.", 422);
    }

    const session = buildMockSession({
      ...mockUser,
      id: "usr_new",
      fullName: payload.fullName,
      email: payload.email,
      role: "owner",
      createdAt: new Date().toISOString(),
    });
    persistSession(session, true);
    return session;
  },

  /** POST /auth/forgot-password */
  async requestPasswordReset(email: string): Promise<{ sent: true }> {
    if (!config.useMockApi) {
      return http.post<{ sent: true }>("/auth/forgot-password", { email });
    }
    await mockLatency(600, 1100);
    if (!email.includes("@")) {
      throw new ApiError("Introdu o adresă de email validă.", 422);
    }
    return { sent: true };
  },

  /** GET /auth/me — restores a session on a page reload. */
  async me(): Promise<User | null> {
    if (!config.useMockApi) {
      if (!tokenStore.get()) return null;
      try {
        return await http.get<User>("/auth/me");
      } catch {
        clearStoredSession();
        return null;
      }
    }
    await mockLatency(120, 260);
    return readStoredSession()?.user ?? null;
  },

  /** POST /auth/logout */
  async logout(): Promise<void> {
    if (!config.useMockApi) {
      await http.post("/auth/logout").catch(() => undefined);
    }
    clearStoredSession();
  },

  /** PUT /auth/me */
  async updateProfile(patch: Partial<User>): Promise<User> {
    if (!config.useMockApi) {
      return http.put<User>("/auth/me", patch);
    }
    await mockLatency();
    const session = readStoredSession();
    const updated = { ...(session?.user ?? mockUser), ...patch };
    if (session) persistSession({ ...session, user: updated }, true);
    return updated;
  },
};
