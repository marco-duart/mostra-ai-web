export type UUID = string;
export type ISODateString = string;

export type DocumentType = "CPF" | "CNPJ";
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

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  document: string;
  documentType: DocumentType;
  whatsapp: string;
  acceptedAppTerms: boolean;
  acceptedAccountTerms: boolean;
  acceptedLgpd: boolean;
}

export interface LoginResponse {
  accessToken: string;
  store: AuthenticatedStoreSummary;
}

export type RegisterResponse = LoginResponse;

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

export interface ProducerProduct {
  id: UUID;
  storeId: UUID;
  categoryId: UUID | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
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
