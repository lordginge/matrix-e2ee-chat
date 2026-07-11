import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ClientEvent, MatrixClient } from "matrix-js-sdk";
import {
  clearSession,
  createClientFromSession,
  loadSession,
  loginWithPassword,
  normalizeBaseUrl,
  type SavedSession,
} from "@/lib/matrix";

type Status = "loading" | "logged-out" | "syncing" | "ready" | "error";

interface MatrixContextValue {
  client: MatrixClient | null;
  status: Status;
  error: string | null;
  login: (baseUrl: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const MatrixContext = createContext<MatrixContextValue | null>(null);

export function MatrixProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<MatrixClient | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<MatrixClient | null>(null);

  // Restore a persisted session on mount
  useEffect(() => {
    const session: SavedSession | null = loadSession();
    if (!session) {
      setStatus("logged-out");
      return;
    }
    createClientFromSession(session)
      .then((c) => {
        clientRef.current = c;
        setClient(c);
        setStatus("syncing");
      })
      .catch((e) => {
        console.error(e);
        clearSession();
        setStatus("logged-out");
      });
  }, []);

  // Track sync state
  useEffect(() => {
    if (!client) return;
    const onSync = (state: string) => {
      if (state === "PREPARED" || state === "SYNCING") setStatus("ready");
      if (state === "ERROR") setStatus("error");
    };
    client.on(ClientEvent.Sync, onSync);
    return () => {
      client.off(ClientEvent.Sync, onSync);
    };
  }, [client]);

  const login = useCallback(
    async (baseUrlInput: string, username: string, password: string) => {
      setError(null);
      setStatus("loading");
      try {
        const baseUrl = normalizeBaseUrl(baseUrlInput);
        const c = await loginWithPassword(baseUrl, username, password);
        clientRef.current = c;
        setClient(c);
        setStatus("syncing");
      } catch (e) {
        setStatus("logged-out");
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw e;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    const c = clientRef.current;
    try {
      await c?.logout(true);
    } catch {
      // ignore — we clear local state regardless
    }
    c?.stopClient();
    clientRef.current = null;
    setClient(null);
    clearSession();
    setStatus("logged-out");
  }, []);

  return (
    <MatrixContext.Provider value={{ client, status, error, login, logout }}>
      {children}
    </MatrixContext.Provider>
  );
}

export function useMatrix() {
  const ctx = useContext(MatrixContext);
  if (!ctx) throw new Error("useMatrix must be used within MatrixProvider");
  return ctx;
}
