import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getTableByToken } from "@/services/table.service";
import type { TableInfo } from "@/types/domain";

type FetchState =
  | { status: "loading" }
  | { status: "success"; data: TableInfo }
  | { status: "not_found" }
  | { status: "error"; message: string };

const REFRESH_INTERVAL_MS = 10_000;

/**
 * Valida o token da mesa no servidor. Um 404 aqui cobre tanto um token
 * inexistente quanto uma mesa já fechada pelo garçom (o servidor apaga o
 * token ao fechar), então nos dois casos mostramos a mesma mensagem de
 * "mesa indisponível" - não há como diferenciar, nem precisa.
 *
 * Depois da primeira carga, atualiza em segundo plano a cada 10s (e sob
 * demanda, via `refresh`) para a página saber quando o chamado foi atendido.
 * Falha de rede nessas atualizações é ignorada: a tela segue com o último dado.
 */
export function useTableInfo(token: string | undefined) {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  const load = useCallback(
    async (background: boolean) => {
      if (!token) {
        setState({ status: "not_found" });
        return;
      }
      try {
        const data = await getTableByToken(token);
        setState({ status: "success", data });
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setState({ status: "not_found" });
          return;
        }
        if (background) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Não foi possível validar a mesa.",
        });
      }
    },
    [token],
  );

  useEffect(() => {
    setState({ status: "loading" });
    void load(false);
    const timer = window.setInterval(() => void load(true), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { state, refresh };
}
