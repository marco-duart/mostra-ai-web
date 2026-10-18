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

export const accountDeletionQueryKey = ["producer", "account-deletion"] as const;

export function useAccountDeletionStatusQuery() {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: accountDeletionQueryKey,
    queryFn: producerService.getAccountDeletionStatus,
    enabled: isAuthenticated,
  });
}

export function useRequestAccountDeletionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => producerService.requestAccountDeletion(password),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountDeletionQueryKey }),
  });
}

export function useCancelAccountDeletionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => producerService.cancelAccountDeletion(),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountDeletionQueryKey }),
  });
}
