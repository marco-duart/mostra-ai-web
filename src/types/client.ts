// Tipos do fluxo de agendamento no site público (cliente final). Diferente
// de `types/producer.ts` (dono da loja, já logado no dashboard web) - aqui é
// uma pessoa anônima que pode nem ter conta ainda. A sessão dela fica em
// localStorage sob uma chave própria (ver src/lib/clientAuth.ts), separada
// da sessão do produtor, pra não colidir caso a mesma pessoa/navegador use
// as duas coisas (ex.: um produtor testando o próprio fluxo de agendamento).

export type UUID = string;
export type ISODateString = string;
export type DocumentType = "CPF" | "CNPJ";

// Mesmo enum do backend (ver prisma/schema.prisma em mostra-ai-server).
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELED" | "COMPLETED";

export type ClientRegisterDto = {
  email: string;
  password: string;
  name: string;
  document: string;
  documentType: DocumentType;
  acceptedAppTerms: boolean;
  acceptedLgpd: boolean;
};

export type ClientUserSummary = {
  id: UUID;
  email: string;
  name: string | null;
};

export type ClientAuthResponse = {
  accessToken: string;
  user: ClientUserSummary;
};

export type AppointmentItem = {
  id: UUID;
  product_id: UUID | null;
  product_name_snapshot: string;
  duration_minutes_snapshot: number | null;
  is_schedulable_snapshot: boolean;
  sort_order: number;
};

export type Appointment = {
  id: UUID;
  status: AppointmentStatus;
  is_estimate_request: boolean;
  starts_at: ISODateString | null;
  ends_at: ISODateString | null;
  estimated_completion_at: ISODateString | null;
  customer_notes: string | null;
  producer_notes: string | null;
  created_at: ISODateString;
  location: { id: UUID; name: string };
  items: AppointmentItem[];
};

export type CreateAppointmentPayload = {
  store_id: UUID;
  location_id: UUID;
  service_ids: UUID[];
  /** Obrigatório para serviços agendáveis; omitido para pedido de orçamento/prazo. */
  starts_at?: ISODateString;
  customer_notes?: string;
};

export type AvailabilityResult =
  | { mode: "estimate" }
  | { mode: "slots"; duration_minutes: number; slots: string[] };
