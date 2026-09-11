import { config } from "@/lib/config";

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const TOKEN_STORAGE_KEY = "docuai.access_token";

export const tokenStore = {
  get(): string | null {
    try {
      return (
        window.localStorage.getItem(TOKEN_STORAGE_KEY) ??
        window.sessionStorage.getItem(TOKEN_STORAGE_KEY)
      );
    } catch {
      return null;
    }
  },
  set(token: string, persist: boolean): void {
    try {
      const store = persist ? window.localStorage : window.sessionStorage;
      store.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      /* storage unavailable — the session simply does not survive a reload */
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
};

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Query parameters appended to the path; undefined values are dropped. */
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const base = config.apiUrl.replace(/\/$/, "");
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * The single place in the frontend that knows how to talk HTTP. Every service
 * module goes through it, so pointing the app at the FastAPI backend is a
 * matter of setting VITE_API_URL and VITE_USE_MOCK_API=false.
 */
async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, params, headers, ...rest } = options;
  const token = tokenStore.get();

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      Accept: "application/json",
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
    ...rest,
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text().catch(() => undefined);
    }
    const message =
      (details as { detail?: string })?.detail ??
      `Cererea a eșuat cu statusul ${response.status}`;
    throw new ApiError(message, response.status, details);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, options),
};
