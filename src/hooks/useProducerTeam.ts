import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { producerService } from "@/services/producer.service";
import { useProducerAuth } from "@/contexts/producerAuth";
import type { LinkStoreMemberDto, UUID } from "@/types/producer";

export const producerTeamQueryKey = ["producer", "team"] as const;

export function useProducerTeamQuery() {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: producerTeamQueryKey,
    queryFn: producerService.listStoreMembers,
    enabled: isAuthenticated,
  });
}

export function useLinkProducerStoreMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: LinkStoreMemberDto) => producerService.linkStoreMember(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerTeamQueryKey }),
  });
}

export function useRemoveProducerStoreMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => producerService.removeStoreMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerTeamQueryKey }),
  });
}

export function useUpdateProducerServiceFeeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, serviceFeePercent }: { id: UUID; serviceFeePercent: number }) =>
      producerService.updateStoreMemberServiceFee(id, serviceFeePercent),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerTeamQueryKey }),
  });
}
