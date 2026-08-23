import { useMutation } from "@tanstack/react-query";
import { producerAuthService } from "@/services/producer-auth.service";
import { producerService } from "@/services/producer.service";
import type { CreateStoreDto, LoginDto, RegisterAccountDto } from "@/types/producer";

export function useProducerLoginMutation() {
  return useMutation({
    mutationFn: (dto: LoginDto) => producerAuthService.login(dto),
  });
}

/** Cria só a conta (sem loja) - 1a etapa do cadastro, espelha o app mobile. */
export function useProducerRegisterMutation() {
  return useMutation({
    mutationFn: (dto: RegisterAccountDto) => producerAuthService.register(dto),
  });
}

/** Cria a loja da conta já autenticada - 2a etapa do cadastro. */
export function useProducerCreateStoreMutation() {
  return useMutation({
    mutationFn: (dto: CreateStoreDto) => producerService.createStore(dto),
  });
}
