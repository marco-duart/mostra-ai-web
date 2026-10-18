import axios from "axios";

/** Extrai a mensagem do erro da API (formato NestJS) para mostrar ao usuário. */
export function parseApiMessage(
  err: unknown,
  fallback = "Não foi possível concluir agora.",
): string {
  if (!axios.isAxiosError(err)) return fallback;
  if (err.response?.status === 429) {
    return "Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo.";
  }
  const body = err.response?.data as { message?: string | string[] } | undefined;
  if (typeof body?.message === "string") return body.message;
  if (Array.isArray(body?.message)) return body.message[0] ?? "Dados inválidos.";
  return err.message || fallback;
}
