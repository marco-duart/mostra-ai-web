export type DeliveryMode = "DELIVERY_ONLY" | "PICKUP_ONLY" | "BOTH" | "NEGOTIATE";
export type OfferingType = "PRODUCT" | "SERVICE" | "BOTH";
export type ProductItemType = "PRODUCT" | "SERVICE";

export interface StoreIdentity {
  // Exposto pelo backend a partir da correção feita junto com o fluxo de
  // agendamento - necessário pra criar o agendamento (POST /client/appointments
  // exige store_id) já que a página pública só tinha o slug até então.
  id: string;
  name: string;
  whatsapp: string;
  instagram: string | null;
  logo_url: string | null;
  background_url: string | null;
  theme_primary_color: string;
  theme_secondary_color: string;
  offering_type: OfferingType;
  is_consumption: boolean | null;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  maps_url: string;
  delivery_mode: DeliveryMode;
  is_open_now: boolean;
  is_current_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  item_type: ProductItemType;
  // Só relevante quando item_type=SERVICE - ver ESPECIFICACAO-AGENDA.md.
  is_schedulable?: boolean | null;
  duration_minutes?: number | null;
}

export interface MenuCategory {
  category_id: string;
  category_name: string;
  sort_order: number;
  products: Product[];
}

export interface StoreCatalog {
  store: StoreIdentity;
  current_location: StoreLocation | null;
  locations: StoreLocation[];
  menu: MenuCategory[];
  message?: string;
}

export interface ContactPayload {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  message: string;
}

export interface ApiErrorShape {
  statusCode: number;
  message:
    | string
    | {
        message: string | string[];
        error?: string;
        statusCode?: number;
      };
}

export interface TableInfo {
  store_slug: string;
  store_name: string;
  table_name: string;
}

export interface AttendanceResult {
  id: string;
  status: string;
}
