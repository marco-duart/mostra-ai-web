export type DeliveryMode = "DELIVERY_ONLY" | "PICKUP_ONLY" | "BOTH" | "NEGOTIATE";

export interface StoreIdentity {
  name: string;
  whatsapp: string;
  instagram: string | null;
  logo_url: string | null;
  background_url: string | null;
  theme_primary_color: string;
  theme_secondary_color: string;
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