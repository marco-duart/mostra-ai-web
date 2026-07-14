import { useEffect, useState } from "react";
import axios from "axios";
import { getStoreBySlug } from "@/services/store.service";
import type { StoreCatalog } from "@/types/domain";

type FetchState =
  | { status: "loading" }
  | { status: "success"; data: StoreCatalog }
  | { status: "not_found" }
  | { status: "error"; message: string };

export function useStoreCatalog(slug: string | undefined) {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    if (!slug) {
      setState({ status: "not_found" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    getStoreBySlug(slug)
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
          message:
            err instanceof Error ? err.message : "Não foi possível carregar a loja.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}