import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { AuthenticatedStoreSummary, LoginResponse } from "@/types/producer";

const TOKEN_STORAGE_KEY = "mostraai.producer.accessToken";
const STORE_STORAGE_KEY = "mostraai.producer.store";

function readJsonStore(): AuthenticatedStoreSummary | null {
  const raw = localStorage.getItem(STORE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthenticatedStoreSummary;
  } catch {
    return null;
  }
}

export function getProducerAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

type ProducerAuthContextValue = {
  accessToken: string | null;
  store: AuthenticatedStoreSummary | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  signIn: (payload: LoginResponse) => void;
  signOut: () => void;
};

const ProducerAuthContext = createContext<ProducerAuthContextValue | null>(null);

export function ProducerAuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [store, setStore] = useState<AuthenticatedStoreSummary | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const parsedStore = readJsonStore();
    setAccessToken(token);
    setStore(parsedStore);
    setIsBootstrapping(false);
  }, []);

  const value = useMemo<ProducerAuthContextValue>(
    () => ({
      accessToken,
      store,
      isBootstrapping,
      isAuthenticated: Boolean(accessToken),
      signIn: (payload) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, payload.accessToken);
        localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(payload.store));
        setAccessToken(payload.accessToken);
        setStore(payload.store);
      },
      signOut: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(STORE_STORAGE_KEY);
        setAccessToken(null);
        setStore(null);
      },
    }),
    [accessToken, store, isBootstrapping],
  );

  return <ProducerAuthContext.Provider value={value}>{children}</ProducerAuthContext.Provider>;
}

export function useProducerAuth() {
  const context = useContext(ProducerAuthContext);
  if (!context) {
    throw new Error("useProducerAuth must be used inside ProducerAuthProvider");
  }
  return context;
}
