import { api } from "@/lib/api";
import type { ContactPayload, StoreCatalog } from "@/types/domain";

export async function getStoreBySlug(slug: string): Promise<StoreCatalog> {
  const { data } = await api.get<StoreCatalog>(
    `/api/v1/public/store/${encodeURIComponent(slug)}`,
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