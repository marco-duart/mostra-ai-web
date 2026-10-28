import { useQuery } from "@tanstack/react-query";
import { useProducerAuth } from "@/contexts/producerAuth";
import { NOVIDADES_STALE_TIME_MS } from "@/lib/novidades";
import { novidadesService, type ProducerWebPlacement } from "@/services/novidades.service";

export function useNovidadesQuery(placement: ProducerWebPlacement) {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: ["novidades", placement],
    queryFn: () => novidadesService.list(placement),
    enabled: isAuthenticated,
    staleTime: NOVIDADES_STALE_TIME_MS,
  });
}
