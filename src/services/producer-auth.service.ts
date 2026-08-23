import { api } from "@/lib/api";
import type {
  LoginDto,
  LoginResponse,
  RegisterAccountDto,
  RegisterAccountResponse,
} from "@/types/producer";

type ApiLoginResponse = {
  access_token: string;
  store: {
    id: string;
    slug: string;
    name: string;
  } | null;
};

type ApiRegisterResponse = {
  access_token: string;
  user: { id: string; email: string; name: string };
  store: null;
};

function mapLoginResponse(data: ApiLoginResponse): LoginResponse {
  return {
    accessToken: data.access_token,
    store: data.store,
  };
}

export const producerAuthService = {
  async login(dto: LoginDto): Promise<LoginResponse> {
    const { data } = await api.post<ApiLoginResponse>("/api/v1/auth/login", dto);
    return mapLoginResponse(data);
  },
  /**
   * Cria apenas a conta (User) - POST /auth/register aceita só os campos
   * abaixo (ValidationPipe com forbidNonWhitelisted rejeita qualquer campo
   * de loja aqui). A loja é criada depois com producerService.createStore(),
   * exatamente como o app mobile faz (registerMutation seguido de
   * createStoreMutation).
   */
  async register(dto: RegisterAccountDto): Promise<RegisterAccountResponse> {
    const { data } = await api.post<ApiRegisterResponse>("/api/v1/auth/register", {
      email: dto.email,
      password: dto.password,
      name: dto.name,
      document: dto.document,
      document_type: dto.documentType,
      accepted_app_terms: dto.acceptedAppTerms,
      accepted_lgpd: dto.acceptedLgpd,
    });
    return { accessToken: data.access_token, user: data.user };
  },
};
