import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { producerService } from "@/services/producer.service";
import { useProducerAuth } from "@/contexts/producerAuth";
import type { CreateTableDto, UUID } from "@/types/producer";

export const producerTablesQueryKey = ["producer", "tables"] as const;
export const producerQueueQueryKey = ["producer", "queue"] as const;

export function useProducerTablesQuery() {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: producerTablesQueryKey,
    queryFn: producerService.listTables,
    enabled: isAuthenticated,
  });
}

export function useCreateProducerTableMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTableDto) => producerService.createTable(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerTablesQueryKey }),
  });
}

export function useDeleteProducerTableMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => producerService.deleteTable(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerTablesQueryKey }),
  });
}

export function useAssignProducerTableMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, storeMemberId }: { tableId: UUID; storeMemberId: UUID }) =>
      producerService.assignTableMember(tableId, storeMemberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerTablesQueryKey }),
  });
}

export function useUnassignProducerTableMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, storeMemberId }: { tableId: UUID; storeMemberId: UUID }) =>
      producerService.unassignTableMember(tableId, storeMemberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerTablesQueryKey }),
  });
}

export function useOpenProducerTableMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => producerService.openTable(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerTablesQueryKey }),
  });
}

export function useCloseProducerTableMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => producerService.closeTable(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerTablesQueryKey }),
  });
}

/**
 * Polling curto (mesmo intervalo do app Partner): a fila de chamados se
 * atualiza sozinha em segundo plano, simulando "tempo real" sem precisar de
 * WebSocket/SSE.
 */
export function useProducerQueueQuery() {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: producerQueueQueryKey,
    queryFn: producerService.listQueue,
    enabled: isAuthenticated,
    refetchInterval: 8_000,
  });
}

export function useAttendProducerQueueItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => producerService.attendQueueItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerQueueQueryKey }),
  });
}
