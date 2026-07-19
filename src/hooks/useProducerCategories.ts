import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { producerService } from "@/services/producer.service";
import { useProducerAuth } from "@/contexts/producerAuth";
import type { CreateCategoryDto, ReorderCategoriesDto, UUID } from "@/types/producer";

export const producerCategoriesQueryKey = ["producer", "categories"] as const;

export function useProducerCategoriesQuery() {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: producerCategoriesQueryKey,
    queryFn: producerService.listCategories,
    enabled: isAuthenticated,
  });
}

export function useCreateProducerCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCategoryDto) => producerService.createCategory(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerCategoriesQueryKey }),
  });
}

export function useReorderProducerCategoriesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ReorderCategoriesDto) => producerService.reorderCategories(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerCategoriesQueryKey }),
  });
}

export function useDeleteProducerCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => producerService.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerCategoriesQueryKey }),
  });
}
