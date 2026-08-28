import { api } from "@/lib/api";
import type { LegalDocument } from "@/types/domain";

export const contractsService = {
  /** Documentos legais ativos (APP_TERMS, ACCOUNT_TERMS, LGPD) - mesmo endpoint
   * que os apps mobile usam no ConsentModal. */
  async listActive(): Promise<LegalDocument[]> {
    const { data } = await api.get<LegalDocument[]>("/api/v1/public/contracts");
    return data;
  },
};
