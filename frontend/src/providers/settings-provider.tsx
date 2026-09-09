import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { settingsApi } from "@/api";
import type { AppSettings } from "@/types";

interface SettingsContextValue {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  save: (patch: Partial<AppSettings>) => Promise<void>;
  reload: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    settingsApi
      .get()
      .then((loaded) => {
        if (!cancelled) {
          setSettings(loaded);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : "Setările nu au putut fi încărcate.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const save = useCallback(async (patch: Partial<AppSettings>) => {
    const updated = await settingsApi.update(patch);
    setSettings(updated);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      error,
      save,
      reload: () => setNonce((current) => current + 1),
    }),
    [settings, loading, error, save],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings trebuie folosit în interiorul unui SettingsProvider.");
  }
  return context;
}
