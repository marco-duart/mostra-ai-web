import type { StoreCatalog } from "@/types/domain";

export const mockStore: StoreCatalog = {
  store: {
    name: "Pastelaria Gourmet do Zé",
    whatsapp: "5562999999999",
    instagram: "pastelariadoze",
    logo_url: null,
    background_url: null,
    theme_primary_color: "#E4572E",
    theme_secondary_color: "#1A1A1A",
  },
  current_location: {
    id: "loc-1",
    name: "Feira de Sábado",
    address: "Praça Criativa, Centro",
    maps_url: "https://maps.google.com",
    delivery_mode: "PICKUP_ONLY",
    is_open_now: true,
    is_current_active: true,
  },
  locations: [],
  menu: [
    {
      category_id: "c1",
      category_name: "Pastéis Tradicionais",
      sort_order: 1,
      products: [
        {
          id: "p1",
          name: "Pastel de Carne",
          description: "Massa crocante com carne temperada.",
          price: 10,
          image_url: null,
        },
      ],
    },
  ],
};