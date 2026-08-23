import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { producerService } from "@/services/producer.service";
import { useProducerAuth } from "@/contexts/producerAuth";
import type { DayOfWeek, ListAppointmentsParams, UUID } from "@/types/producer";

export const producerAppointmentsQueryKey = (params: ListAppointmentsParams) =>
  ["producer", "appointments", params] as const;

export function useProducerAppointmentsQuery(params: ListAppointmentsParams) {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: producerAppointmentsQueryKey(params),
    queryFn: () => producerService.listAppointments(params),
    enabled: isAuthenticated,
  });
}

export function useConfirmProducerAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: UUID; estimatedCompletionAt?: string }) =>
      producerService.confirmAppointment(input.id, input.estimatedCompletionAt),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["producer", "appointments"] }),
  });
}

export function useRejectProducerAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: UUID; producerNotes?: string }) =>
      producerService.rejectAppointment(input.id, input.producerNotes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["producer", "appointments"] }),
  });
}

export const producerAvailabilityQueryKey = (locationId: UUID) =>
  ["producer", "locations", locationId, "availability"] as const;

export function useProducerAvailabilityQuery(locationId?: UUID) {
  const { isAuthenticated } = useProducerAuth();
  return useQuery({
    queryKey: locationId
      ? producerAvailabilityQueryKey(locationId)
      : ["producer", "locations", "unknown", "availability"],
    queryFn: () => producerService.getLocationAvailability(locationId as UUID),
    enabled: isAuthenticated && Boolean(locationId),
  });
}

export function useReplaceProducerAvailabilityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      locationId: UUID;
      slots: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }[];
    }) => producerService.replaceLocationAvailability(input.locationId, input.slots),
    onSuccess: (data, variables) => {
      qc.setQueryData(producerAvailabilityQueryKey(variables.locationId), data);
    },
  });
}
