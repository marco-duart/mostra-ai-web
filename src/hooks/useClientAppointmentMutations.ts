import { useMutation } from "@tanstack/react-query";
import { clientAuthService } from "@/services/client-auth.service";
import { createAppointment } from "@/services/appointment.service";
import type { ClientRegisterDto, CreateAppointmentPayload } from "@/types/client";

export function useClientRegisterMutation() {
  return useMutation({
    mutationFn: (dto: ClientRegisterDto) => clientAuthService.register(dto),
  });
}

export function useCreateAppointmentMutation() {
  return useMutation({
    mutationFn: (input: { payload: CreateAppointmentPayload; token: string }) =>
      createAppointment(input.payload, input.token),
  });
}
