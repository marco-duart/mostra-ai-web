import { useEffect, useState } from "react";
import axios from "axios";
import { getTableByToken } from "@/services/table.service";
import type { TableInfo } from "@/types/domain";

type FetchState =
  | { status: "loading" }
  | { status: "success"; data: TableInfo }
  | { status: "not_found" }
  | { status: "error"; message: string };

/**
 * Valida o token da mesa no servidor. Um 404 aqui cobre tanto um token
 * inexistente quanto uma mesa já fechada pelo garçom (o servidor apaga o
 * token ao fechar), então nos dois casos mostramos a mesma mensagem de
 * "mesa indisponível" - não há como diferenciar, nem precisa.
 */
export function useTableInfo(token: string | undefined) {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ status: "not_found" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    getTableByToken(token)
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setState({ status: "not_found" });
          return;
        }
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Não foi possível validar a mesa.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return state;
}
