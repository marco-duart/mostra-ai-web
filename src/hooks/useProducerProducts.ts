import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { producerService } from "@/services/producer.service";
import { useProducerAuth } from "@/contexts/producerAuth";
import type { CreateProductDto, UpdateProductDto, UUID } from "@/types/producer";

export const producerProductsQueryKey = ["producer", "products"] as const;

export function producerProductQueryKey(id: UUID) {
  return ["producer", "products", id] as const;
}

export function useProducerProductsQuery() {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: producerProductsQueryKey,
    queryFn: producerService.listProducts,
    enabled: isAuthenticated,
  });
}

export function useCreateProducerProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => producerService.createProduct(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerProductsQueryKey }),
  });
}

export function useUpdateProducerProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: UUID; dto: UpdateProductDto }) =>
      producerService.updateProduct(input.id, input.dto),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: producerProductsQueryKey });
      qc.setQueryData(producerProductQueryKey(data.id), data);
    },
  });
}

export function useDeleteProducerProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => producerService.deleteProduct(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: producerProductsQueryKey });
      qc.removeQueries({ queryKey: producerProductQueryKey(id) });
    },
  });
}

export function useUploadProducerProductImageMutation() {
  return useMutation({
    mutationFn: (file: File) => producerService.uploadProductImage(file),
  });
}
