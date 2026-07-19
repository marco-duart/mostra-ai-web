import { useMutation } from "@tanstack/react-query";
import { producerAuthService } from "@/services/producer-auth.service";
import type { LoginDto, RegisterDto } from "@/types/producer";

export function useProducerLoginMutation() {
  return useMutation({
    mutationFn: (dto: LoginDto) => producerAuthService.login(dto),
  });
}

export function useProducerRegisterMutation() {
  return useMutation({
    mutationFn: (dto: RegisterDto) => producerAuthService.register(dto),
  });
}
