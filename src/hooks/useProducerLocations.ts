import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { producerService } from "@/services/producer.service";
import { useProducerAuth } from "@/contexts/producerAuth";
import type { CreateLocationDto, UpdateLocationDto, UUID } from "@/types/producer";

export const producerLocationsQueryKey = ["producer", "locations"] as const;

export function useProducerLocationsQuery() {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: producerLocationsQueryKey,
    queryFn: producerService.listLocations,
    enabled: isAuthenticated,
  });
}

export function useCreateProducerLocationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLocationDto) => producerService.createLocation(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerLocationsQueryKey }),
  });
}

export function useUpdateProducerLocationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: UUID; dto: UpdateLocationDto }) =>
      producerService.updateLocation(input.id, input.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerLocationsQueryKey }),
  });
}

export function useDeleteProducerLocationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => producerService.deleteLocation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerLocationsQueryKey }),
  });
}

export function useActivateProducerLocationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => producerService.activateLocation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: producerLocationsQueryKey }),
  });
}
