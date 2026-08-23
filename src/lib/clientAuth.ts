import type { ClientUserSummary } from "@/types/client";

// Sessão do cliente final no fluxo de agendamento do site público. Chave
// própria, separada da sessão do produtor (`mostraai.producer.*`, ver
// contexts/producerAuth.tsx) - são identidades diferentes que podem
// coexistir no mesmo navegador.
const TOKEN_KEY = "mostraai.webclient.accessToken";
const USER_KEY = "mostraai.webclient.user";

export function getClientToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getClientUser(): ClientUserSummary | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClientUserSummary;
  } catch {
    return null;
  }
}

export function setClientSession(token: string, user: ClientUserSummary): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearClientSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
