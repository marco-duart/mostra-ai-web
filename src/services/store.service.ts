import { api } from "@/lib/api";
import type { ContactPayload, StoreCatalog } from "@/types/domain";
import type { AvailabilityResult } from "@/types/client";

export async function getStoreBySlug(slug: string): Promise<StoreCatalog> {
  const { data } = await api.get<StoreCatalog>(
    `/api/v1/public/store/${encodeURIComponent(slug)}`,
  );
  return data;
}

/**
 * Horários livres pra uma combinação de serviços agendáveis num dia. Se
 * algum serviço escolhido não for agendável, o backend devolve
 * {mode:"estimate"} - ver comentário em
 * mostra-ai-server/src/public/store.service.ts.
 */
export async function getAvailability(
  slug: string,
  params: { locationId: string; date: string; serviceIds: string[] },
): Promise<AvailabilityResult> {
  const { data } = await api.get<AvailabilityResult>(
    `/api/v1/public/store/${encodeURIComponent(slug)}/availability`,
    {
      params: {
        locationId: params.locationId,
        date: params.date,
        serviceIds: params.serviceIds.join(","),
      },
    },
  );
  return data;
}

export async function sendContactMessage(
  slug: string,
  payload: ContactPayload,
): Promise<{ success: true }> {
  const { data } = await api.post<{ success: true }>(
    `/api/v1/public/store/${encodeURIComponent(slug)}/contact`,
    payload,
  );
  return data;
}