export type UUID = string;
export type ISODateString = string;

export type DocumentType = "CPF" | "CNPJ";
export type OfferingType = "PRODUCT" | "SERVICE" | "BOTH";
export type DeliveryMode = "DELIVERY_ONLY" | "PICKUP_ONLY" | "BOTH" | "NEGOTIATE";
export type PlanType = "FREE" | "PREMIUM";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELED";
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface AuthenticatedStoreSummary {
  id: UUID;
  slug: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Cria apenas a conta (User), espelhando o RegisterDto do servidor
 * (POST /auth/register). A loja é criada depois, num segundo passo, via
 * CreateStoreDto (POST /producer/store) - mesma separação usada pelo app
 * mobile do Produtor.
 */
export interface RegisterAccountDto {
  email: string;
  password: string;
  name: string;
  document: string;
  documentType: DocumentType;
  acceptedAppTerms: boolean;
  acceptedLgpd: boolean;
}

/**
 * Cria a loja para o usuário já autenticado (POST /producer/store).
 * Corresponde ao CreateStoreDto do servidor.
 */
export interface CreateStoreDto {
  name: string;
  offeringType: OfferingType;
  isConsumption?: boolean;
  whatsapp: string;
  acceptedAccountTerms: boolean;
}

export interface LoginResponse {
  accessToken: string;
  store: AuthenticatedStoreSummary | null;
}

export type RegisterAccountResponse = {
  accessToken: string;
  user: { id: UUID; email: string; name: string };
};

export interface SubscriptionSummary {
  planType: PlanType;
  status: SubscriptionStatus;
  expiresAt: ISODateString;
}

export interface ProducerStore {
  id: UUID;
  slug: string;
  name: string;
  document: string;
  documentType: DocumentType;
  offeringType: OfferingType;
  isConsumption: boolean | null;
  whatsapp: string;
  instagram: string | null;
  logoUrl: string | null;
  backgroundUrl: string | null;
  themePrimaryColor: string;
  themeSecondaryColor: string;
  isActive: boolean;
  disabledAt: ISODateString | null;
  disableReason: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  subscription: SubscriptionSummary | null;
}

export type UpdateStoreDto = Partial<{
  name: string;
  offeringType: OfferingType;
  isConsumption: boolean | null;
  whatsapp: string;
  instagram: string | null;
  logoUrl: string | null;
  backgroundUrl: string | null;
  themePrimaryColor: string;
  themeSecondaryColor: string;
}>;

export interface ProducerCategory {
  id: UUID;
  storeId: UUID;
  name: string;
  sortOrder: number;
}

export interface CreateCategoryDto {
  name: string;
}

export interface ReorderCategoriesDto {
  ids: UUID[];
}

export interface ProducerLocationSchedule {
  id: UUID;
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
}

export interface ProducerLocation {
  id: UUID;
  storeId: UUID;
  name: string;
  address: string;
  googleMapsUrl: string;
  deliveryMode: DeliveryMode;
  isCurrentActive: boolean;
  isOpenNow: boolean;
  schedules?: ProducerLocationSchedule[];
}

export interface CreateLocationDto {
  name: string;
  address: string;
  googleMapsUrl: string;
  deliveryMode: DeliveryMode;
}

export type UpdateLocationDto = Partial<CreateLocationDto>;

// PRODUCT = item de venda comum; SERVICE = item da Agenda (agendamento). Só
// relevante quando a loja é offeringType SERVICE ou BOTH - mesma distinção
// usada no mobile (ver mostra-ai-mobile/src/types/product.ts).
export type ProductItemType = "PRODUCT" | "SERVICE";

export interface ProducerProduct {
  id: UUID;
  storeId: UUID;
  categoryId: UUID | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  itemType: ProductItemType;
  // Só fazem sentido quando itemType === "SERVICE".
  isSchedulable: boolean | null;
  durationMinutes: number | null;
}

export interface CreateProductDto {
  name: string;
  description?: string | null;
  price: number;
  categoryId?: UUID | null;
  imageUrl?: string | null;
}

export type UpdateProductDto = Partial<CreateProductDto> & {
  isAvailable?: boolean;
};

/**
 * Configuração de Agenda do produto - endpoint separado
 * (PATCH /producer/products/:id/scheduling) porque não faz parte da edição
 * comum de produto (nome/preço/foto), mesma separação usada pelo mobile.
 */
export interface UpdateProductSchedulingDto {
  itemType?: ProductItemType;
  isSchedulable?: boolean;
  durationMinutes?: number;
}

// ---- Mesas (Tables) + Chamados (Chama Garçom) ----------------------------

export type TableStatus = "OPEN" | "CLOSED";

export interface TableMemberSummary {
  storeMemberId: UUID;
  name: string | null;
  role: string | null;
}

export interface ProducerTable {
  id: UUID;
  name: string;
  status: TableStatus;
  currentToken: string | null;
  openedAt: string | null;
  locationId: UUID;
  locationName: string;
  members: TableMemberSummary[];
}

export interface CreateTableDto {
  locationId: UUID;
  name: string;
}

/**
 * Item da fila de atendimento (ex.: chamada de garçom). No mobile isso só
 * existe no app Partner (StoreMember); na web, o dono da loja enxerga a
 * fila inteira direto pelo painel, sem precisar virar parceiro dela.
 */
export interface QueueItem {
  id: UUID;
  tableId: UUID;
  tableName: string;
  createdAt: ISODateString;
}

// ---- Equipe (Team / Partners) --------------------------------------------

export interface StoreMember {
  id: UUID;
  role: string | null;
  serviceFeePercent: number | null;
  user: {
    id: UUID;
    name: string | null;
    email: string;
    document: string | null;
  };
}

export interface LinkStoreMemberDto {
  document: string;
  role?: string;
  serviceFeePercent: number;
}

// ---- Agenda (Appointments + Availability) --------------------------------

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELED" | "COMPLETED";

export interface AppointmentItem {
  id: UUID;
  productId: UUID | null;
  productNameSnapshot: string;
  durationMinutesSnapshot: number | null;
  isSchedulableSnapshot: boolean;
  sortOrder: number;
}

export interface Appointment {
  id: UUID;
  storeId: UUID;
  locationId: UUID;
  locationName: string;
  customerId: UUID;
  customerName: string | null;
  customerEmail: string | null;
  status: AppointmentStatus;
  isEstimateRequest: boolean;
  startsAt: ISODateString | null;
  endsAt: ISODateString | null;
  estimatedCompletionAt: ISODateString | null;
  customerNotes: string | null;
  producerNotes: string | null;
  createdAt: ISODateString;
  items: AppointmentItem[];
}

export interface ListAppointmentsParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  status?: AppointmentStatus;
  locationId?: UUID;
}

// Turno em que uma Localização aceita agendamento - diferente do horário de
// funcionamento (ProducerLocationSchedule).
export interface LocationAvailabilitySlot {
  id?: UUID;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

// ---- Comanda Digital -------------------------------------------------------

export type ComandaStatus = "OPEN" | "CLOSED";

export interface ComandaSummary {
  id: UUID;
  status: ComandaStatus;
  tableId: UUID | null;
  tableName: string;
  responsibleName: string;
  openedAt: string;
  closedAt: string | null;
  itemCount: number;
  subtotal: number;
  serviceFee: number;
  total: number;
}

export interface ComandaDiscount {
  type: "PERCENT" | "AMOUNT";
  value: number;
  reason: string | null;
}

export interface ComandaItem {
  id: UUID;
  name: string;
  unitPrice: number;
  quantity: number;
  notes: string | null;
  status: "ACTIVE" | "CANCELED";
  discount: ComandaDiscount | null;
  lineGross: number;
  lineDiscount: number;
  lineNet: number;
  addedByName: string | null;
  canceledByName: string | null;
  cancelReason: string | null;
}

export interface ComandaDetail extends ComandaSummary {
  serviceFeePercent: number;
  serviceFeeApplied: boolean;
  closedByName: string | null;
  closedByOwner: boolean;
  discount: (ComandaDiscount & { byName: string | null }) | null;
  items: ComandaItem[];
  totals: {
    gross: number;
    itemDiscounts: number;
    comandaDiscount: number;
    discountTotal: number;
    subtotal: number;
    serviceFee: number;
    total: number;
  };
}

export interface ComandaReportBucket {
  comandas: number;
  gross: number;
  sales: number;
  discounts: number;
  serviceFee: number;
  total: number;
  averageTicket: number;
  feeWaived: number;
}

export interface ComandaReport {
  from: string;
  to: string;
  general: ComandaReportBucket;
  byWaiter: (ComandaReportBucket & { memberId: UUID | null; name: string })[];
}

export interface ComandaFilter {
  status?: ComandaStatus;
  from?: string;
  to?: string;
}
