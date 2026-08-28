import { useEffect, useState } from "react";
import { contractsService } from "@/services/contracts.service";
import type { LegalDocument } from "@/types/domain";

type FetchState =
  | { status: "loading" }
  | { status: "success"; data: LegalDocument[] }
  | { status: "error"; message: string };

export function useContracts() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    contractsService
      .listActive()
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Não foi possível carregar os termos.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
