import { api } from "@/lib/api";
import type { Appointment, CreateAppointmentPayload } from "@/types/client";

/**
 * Cria um agendamento (ou pedido de orçamento/prazo) em nome do cliente
 * recém-cadastrado (ou já com sessão salva neste navegador). Exige o
 * access_token porque POST /client/appointments é protegido por JWT.
 */
export async function createAppointment(
  payload: CreateAppointmentPayload,
  accessToken: string,
): Promise<Appointment> {
  const { data } = await api.post<Appointment>("/api/v1/client/appointments", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}
