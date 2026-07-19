import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { producerService } from "@/services/producer.service";
import { useProducerAuth } from "@/contexts/producerAuth";
import type { UpdateStoreDto } from "@/types/producer";

export const producerStoreQueryKey = ["producer", "store"] as const;

export function useProducerStoreQuery() {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: producerStoreQueryKey,
    queryFn: producerService.getStore,
    enabled: isAuthenticated,
  });
}

export function useUpdateProducerStoreMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateStoreDto) => producerService.updateStore(dto),
    onSuccess: (data) => qc.setQueryData(producerStoreQueryKey, data),
  });
}

export function useUploadProducerStoreLogoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => producerService.uploadStoreLogo(file),
    onSuccess: (data) => qc.setQueryData(producerStoreQueryKey, data),
  });
}

export function useUploadProducerStoreBackgroundMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => producerService.uploadStoreBackground(file),
    onSuccess: (data) => qc.setQueryData(producerStoreQueryKey, data),
  });
}

export function useDisableProducerStoreMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => producerService.disableStore(reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerStoreQueryKey }),
  });
}
