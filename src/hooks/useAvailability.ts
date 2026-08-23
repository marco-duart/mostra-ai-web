import { useEffect, useState } from "react";
import { getAvailability } from "@/services/store.service";
import type { AvailabilityResult } from "@/types/client";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: AvailabilityResult }
  | { status: "error"; message: string };

/**
 * Mesmo padrão de `useStoreCatalog` (useEffect + useState, sem react-query) -
 * fica idle até ter localização, data e ao menos um serviço escolhidos.
 */
export function useAvailability(
  slug: string | undefined,
  locationId: string | null,
  date: string | null,
  serviceIds: string[],
) {
  const [state, setState] = useState<FetchState>({ status: "idle" });
  const serviceIdsKey = serviceIds.join(",");

  useEffect(() => {
    if (!slug || !locationId || !date || serviceIds.length === 0) {
      setState({ status: "idle" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    getAvailability(slug, { locationId, date, serviceIds })
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Não foi possível calcular os horários.",
        });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, locationId, date, serviceIdsKey]);

  return state;
}
