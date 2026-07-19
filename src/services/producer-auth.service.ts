import { api } from "@/lib/api";
import type { LoginDto, LoginResponse, RegisterDto, RegisterResponse } from "@/types/producer";

type ApiAuthResponse = {
  access_token: string;
  store: {
    id: string;
    slug: string;
    name: string;
  };
};

function mapAuthResponse(data: ApiAuthResponse): LoginResponse {
  return {
    accessToken: data.access_token,
    store: data.store,
  };
}

export const producerAuthService = {
  async login(dto: LoginDto): Promise<LoginResponse> {
    const { data } = await api.post<ApiAuthResponse>("/api/v1/auth/login", dto);
    return mapAuthResponse(data);
  },
  async register(dto: RegisterDto): Promise<RegisterResponse> {
    const { data } = await api.post<ApiAuthResponse>("/api/v1/auth/register", {
      email: dto.email,
      password: dto.password,
      name: dto.name,
      document: dto.document,
      document_type: dto.documentType,
      whatsapp: dto.whatsapp,
      accepted_app_terms: dto.acceptedAppTerms,
      accepted_account_terms: dto.acceptedAccountTerms,
      accepted_lgpd: dto.acceptedLgpd,
    });
    return mapAuthResponse(data);
  },
};
