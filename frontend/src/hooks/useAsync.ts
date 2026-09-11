import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncResult<T> extends AsyncState<T> {
  reload: () => void;
  setData: (updater: T | ((current: T | null) => T | null)) => void;
}

function messageFor(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "A apărut o eroare neașteptată.";
}

/**
 * Runs an async service call, tracking loading and error state and discarding
 * results from superseded calls. Every page uses it so loading, empty and
 * error states behave identically across the app.
 */
export function useAsync<T>(
  factory: () => Promise<T>,
  deps: React.DependencyList,
): UseAsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const [nonce, setNonce] = useState(0);
  const callId = useRef(0);

  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  useEffect(() => {
    const id = ++callId.current;
    setState((current) => ({ ...current, loading: true, error: null }));

    factoryRef
      .current()
      .then((data) => {
        if (id === callId.current) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (id === callId.current)
          setState({ data: null, loading: false, error: messageFor(error) });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  const setData = useCallback(
    (updater: T | ((current: T | null) => T | null)) => {
      setState((current) => ({
        ...current,
        data:
          typeof updater === "function"
            ? (updater as (value: T | null) => T | null)(current.data)
            : updater,
      }));
    },
    [],
  );

  return { ...state, reload, setData };
}
