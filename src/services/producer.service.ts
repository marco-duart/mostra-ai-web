import { api } from "@/lib/api";
import { getProducerAccessToken } from "@/contexts/producerAuth";
import type {
  CreateCategoryDto,
  CreateLocationDto,
  CreateProductDto,
  ProducerCategory,
  ProducerLocation,
  ProducerProduct,
  ProducerStore,
  ReorderCategoriesDto,
  UpdateLocationDto,
  UpdateProductDto,
  UpdateStoreDto,
  UUID,
} from "@/types/producer";

function authHeaders() {
  const token = getProducerAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type ApiStore = {
  id: string;
  slug: string;
  name: string;
  document: string;
  document_type: ProducerStore["documentType"];
  whatsapp: string;
  instagram: string | null;
  logo_url: string | null;
  background_url: string | null;
  theme_primary_color: string;
  theme_secondary_color: string;
  is_active: boolean;
  disabled_at: string | null;
  disable_reason: string | null;
  created_at: string;
  updated_at: string;
  subscription?: {
    plan_type: NonNullable<ProducerStore["subscription"]>["planType"];
    status: NonNullable<ProducerStore["subscription"]>["status"];
    expires_at: string;
  } | null;
};

function mapStore(data: ApiStore): ProducerStore {
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    document: data.document,
    documentType: data.document_type,
    whatsapp: data.whatsapp,
    instagram: data.instagram,
    logoUrl: data.logo_url,
    backgroundUrl: data.background_url,
    themePrimaryColor: data.theme_primary_color,
    themeSecondaryColor: data.theme_secondary_color,
    isActive: data.is_active,
    disabledAt: data.disabled_at,
    disableReason: data.disable_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    subscription: data.subscription
      ? {
          planType: data.subscription.plan_type,
          status: data.subscription.status,
          expiresAt: data.subscription.expires_at,
        }
      : null,
  };
}

type ApiCategory = {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
};

function mapCategory(data: ApiCategory): ProducerCategory {
  return {
    id: data.id,
    storeId: data.store_id,
    name: data.name,
    sortOrder: data.sort_order,
  };
}

type ApiLocation = {
  id: string;
  store_id: string;
  name: string;
  address: string;
  maps_url: string;
  delivery_mode: ProducerLocation["deliveryMode"];
  is_current_active: boolean;
  is_open_now: boolean;
  schedules?: {
    id: string;
    day_of_week: number;
    open_time: string;
    close_time: string;
  }[];
};

function mapLocation(data: ApiLocation): ProducerLocation {
  return {
    id: data.id,
    storeId: data.store_id,
    name: data.name,
    address: data.address,
    googleMapsUrl: data.maps_url,
    deliveryMode: data.delivery_mode,
    isCurrentActive: data.is_current_active,
    isOpenNow: data.is_open_now,
    schedules: data.schedules?.map((schedule) => ({
      id: schedule.id,
      dayOfWeek: schedule.day_of_week as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      openTime: schedule.open_time,
      closeTime: schedule.close_time,
    })),
  };
}

type ApiProduct = {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

function mapProduct(data: ApiProduct): ProducerProduct {
  return {
    id: data.id,
    storeId: data.store_id,
    categoryId: data.category_id,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.image_url,
    isAvailable: data.is_available,
  };
}

export const producerService = {
  async getStore(): Promise<ProducerStore> {
    const { data } = await api.get<ApiStore>("/api/v1/producer/store", {
      headers: authHeaders(),
    });
    return mapStore(data);
  },
  async updateStore(dto: UpdateStoreDto): Promise<ProducerStore> {
    const payload = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.whatsapp !== undefined ? { whatsapp: dto.whatsapp } : {}),
      ...(dto.instagram !== undefined ? { instagram: dto.instagram } : {}),
      ...(dto.logoUrl !== undefined ? { logo_url: dto.logoUrl } : {}),
      ...(dto.backgroundUrl !== undefined ? { background_url: dto.backgroundUrl } : {}),
      ...(dto.themePrimaryColor !== undefined
        ? { theme_primary_color: dto.themePrimaryColor }
        : {}),
      ...(dto.themeSecondaryColor !== undefined
        ? { theme_secondary_color: dto.themeSecondaryColor }
        : {}),
    };
    const { data } = await api.patch<ApiStore>("/api/v1/producer/store", payload, {
      headers: authHeaders(),
    });
    return mapStore(data);
  },
  async uploadStoreLogo(file: File): Promise<ProducerStore> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<ApiStore>("/api/v1/producer/store/upload-logo", formData, {
      headers: {
        ...authHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return mapStore(data);
  },
  async uploadStoreBackground(file: File): Promise<ProducerStore> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<ApiStore>("/api/v1/producer/store/upload-background", formData, {
      headers: {
        ...authHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return mapStore(data);
  },
  async disableStore(reason?: string): Promise<void> {
    await api.patch(
      "/api/v1/producer/store/disable",
      {
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      },
      { headers: authHeaders() },
    );
  },

  async listCategories(): Promise<ProducerCategory[]> {
    const { data } = await api.get<ApiCategory[]>("/api/v1/producer/categories", {
      headers: authHeaders(),
    });
    return data.map(mapCategory);
  },
  async createCategory(dto: CreateCategoryDto): Promise<ProducerCategory> {
    const { data } = await api.post<ApiCategory>("/api/v1/producer/categories", dto, {
      headers: authHeaders(),
    });
    return mapCategory(data);
  },
  async reorderCategories(dto: ReorderCategoriesDto): Promise<void> {
    await api.patch(
      "/api/v1/producer/categories/reorder",
      { ids: dto.ids },
      { headers: authHeaders() },
    );
  },
  async deleteCategory(id: UUID): Promise<void> {
    await api.delete(`/api/v1/producer/categories/${id}`, {
      headers: authHeaders(),
    });
  },

  async listLocations(): Promise<ProducerLocation[]> {
    const { data } = await api.get<ApiLocation[]>("/api/v1/producer/locations", {
      headers: authHeaders(),
    });
    return data.map(mapLocation);
  },
  async createLocation(dto: CreateLocationDto): Promise<ProducerLocation> {
    const payload = {
      name: dto.name,
      address: dto.address,
      maps_url: dto.googleMapsUrl,
      delivery_mode: dto.deliveryMode,
    };
    const { data } = await api.post<ApiLocation>("/api/v1/producer/locations", payload, {
      headers: authHeaders(),
    });
    return mapLocation(data);
  },
  async updateLocation(id: UUID, dto: UpdateLocationDto): Promise<ProducerLocation> {
    const payload = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.googleMapsUrl !== undefined ? { maps_url: dto.googleMapsUrl } : {}),
      ...(dto.deliveryMode !== undefined ? { delivery_mode: dto.deliveryMode } : {}),
    };
    const { data } = await api.patch<ApiLocation>(`/api/v1/producer/locations/${id}`, payload, {
      headers: authHeaders(),
    });
    return mapLocation(data);
  },
  async deleteLocation(id: UUID): Promise<void> {
    await api.delete(`/api/v1/producer/locations/${id}`, {
      headers: authHeaders(),
    });
  },
  async activateLocation(id: UUID): Promise<void> {
    await api.patch(
      `/api/v1/producer/locations/${id}/activate`,
      {},
      { headers: authHeaders() },
    );
  },

  async listProducts(): Promise<ProducerProduct[]> {
    const { data } = await api.get<ApiProduct[]>("/api/v1/producer/products", {
      headers: authHeaders(),
    });
    return data.map(mapProduct);
  },
  async getProductById(id: UUID): Promise<ProducerProduct> {
    const { data } = await api.get<ApiProduct>(`/api/v1/producer/products/${id}`, {
      headers: authHeaders(),
    });
    return mapProduct(data);
  },
  async createProduct(dto: CreateProductDto): Promise<ProducerProduct> {
    const createPayload = {
      name: dto.name,
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      price: dto.price,
      ...(dto.imageUrl !== undefined ? { image_url: dto.imageUrl } : {}),
    };
    const { data: created } = await api.post<ApiProduct>(
      "/api/v1/producer/products",
      createPayload,
      { headers: authHeaders() },
    );

    if (dto.categoryId) {
      const { data: updated } = await api.patch<ApiProduct>(
        `/api/v1/producer/products/${created.id}`,
        { category_id: dto.categoryId },
        { headers: authHeaders() },
      );
      return mapProduct(updated);
    }

    return mapProduct(created);
  },
  async updateProduct(id: UUID, dto: UpdateProductDto): Promise<ProducerProduct> {
    const payload = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.price !== undefined ? { price: dto.price } : {}),
      ...(dto.categoryId !== undefined ? { category_id: dto.categoryId } : {}),
      ...(dto.imageUrl !== undefined ? { image_url: dto.imageUrl } : {}),
      ...(dto.isAvailable !== undefined ? { is_available: dto.isAvailable } : {}),
    };
    const { data } = await api.patch<ApiProduct>(`/api/v1/producer/products/${id}`, payload, {
      headers: authHeaders(),
    });
    return mapProduct(data);
  },
  async deleteProduct(id: UUID): Promise<void> {
    await api.delete(`/api/v1/producer/products/${id}`, {
      headers: authHeaders(),
    });
  },
  async uploadProductImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ image_url: string }>(
      "/api/v1/producer/products/upload-image",
      formData,
      {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data.image_url;
  },
};
