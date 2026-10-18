import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { comandaService } from "@/services/comanda.service";
import { useProducerAuth } from "@/contexts/producerAuth";
import type { ComandaFilter, UUID } from "@/types/producer";

const baseKey = ["producer", "comandas"] as const;

export function useProducerComandasQuery(filter: ComandaFilter) {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: [...baseKey, "list", filter],
    queryFn: () => comandaService.list(filter),
    enabled: isAuthenticated,
    refetchInterval: filter.status === "OPEN" ? 15_000 : false,
  });
}

export function useProducerComandaQuery(id: UUID | null) {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: [...baseKey, "detail", id],
    queryFn: () => comandaService.get(id as UUID),
    enabled: isAuthenticated && Boolean(id),
  });
}

export function useProducerComandaReportQuery(range: { from?: string; to?: string }) {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: [...baseKey, "report", range],
    queryFn: () => comandaService.report(range),
    enabled: isAuthenticated,
  });
}

export function useCloseProducerComandaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, applyServiceFee }: { id: UUID; applyServiceFee: boolean }) =>
      comandaService.close(id, applyServiceFee),
    onSuccess: () => qc.invalidateQueries({ queryKey: baseKey }),
  });
}
