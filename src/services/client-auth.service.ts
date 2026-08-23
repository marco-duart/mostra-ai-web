import { api } from "@/lib/api";
import type { ClientAuthResponse, ClientRegisterDto } from "@/types/client";

type ApiClientAuthResponse = {
  access_token: string;
  user: { id: string; email: string; name: string | null };
};

function mapAuthResponse(data: ApiClientAuthResponse): ClientAuthResponse {
  return { accessToken: data.access_token, user: data.user };
}

export const clientAuthService = {
  /**
   * Cadastro inline durante o fluxo de agendamento. Usa o mesmo POST
   * /auth/register do app Cliente (mostra-ai-mobile-client) - conta e loja
   * são coisas separadas no backend, então esta chamada só cria a conta da
   * pessoa, sem criar loja nenhuma. Envia só os campos que o RegisterDto do
   * servidor aceita (a ValidationPipe global rejeita propriedade extra).
   */
  async register(dto: ClientRegisterDto): Promise<ClientAuthResponse> {
    const { data } = await api.post<ApiClientAuthResponse>("/api/v1/auth/register", {
      email: dto.email,
      password: dto.password,
      name: dto.name,
      document: dto.document,
      document_type: dto.documentType,
      accepted_app_terms: dto.acceptedAppTerms,
      accepted_lgpd: dto.acceptedLgpd,
    });
    return mapAuthResponse(data);
  },
};
