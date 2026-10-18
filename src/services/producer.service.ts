import { api } from "@/lib/api";
import { getProducerAccessToken } from "@/contexts/producerAuth";
import type {
  Appointment,
  AppointmentStatus,
  AuthenticatedStoreSummary,
  CreateCategoryDto,
  CreateLocationDto,
  CreateProductDto,
  CreateStoreDto,
  CreateTableDto,
  DayOfWeek,
  LinkStoreMemberDto,
  ListAppointmentsParams,
  LocationAvailabilitySlot,
  ProducerCategory,
  ProducerLocation,
  ProducerProduct,
  ProducerStore,
  ProducerTable,
  ProductItemType,
  QueueItem,
  ReorderCategoriesDto,
  StoreMember,
  UpdateLocationDto,
  UpdateProductDto,
  UpdateProductSchedulingDto,
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
  offering_type: ProducerStore["offeringType"];
  is_consumption: boolean | null;
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
    offeringType: data.offering_type,
    isConsumption: data.is_consumption,
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
  item_type: ProductItemType;
  is_schedulable: boolean | null;
  duration_minutes: number | null;
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
    itemType: data.item_type,
    isSchedulable: data.is_schedulable,
    durationMinutes: data.duration_minutes,
  };
}

type ApiTable = {
  id: string;
  name: string;
  status: ProducerTable["status"];
  current_token: string | null;
  opened_at: string | null;
  location: { id: string; name: string };
  members: {
    store_member: {
      id: string;
      role: string | null;
      user: { name: string | null };
    };
  }[];
};

function mapTable(data: ApiTable): ProducerTable {
  return {
    id: data.id,
    name: data.name,
    status: data.status,
    currentToken: data.current_token,
    openedAt: data.opened_at,
    locationId: data.location.id,
    locationName: data.location.name,
    members: data.members.map((m) => ({
      storeMemberId: m.store_member.id,
      name: m.store_member.user.name,
      role: m.store_member.role,
    })),
  };
}

type ApiQueueItem = {
  id: string;
  created_at: string;
  table: { id: string; name: string };
};

function mapQueueItem(data: ApiQueueItem): QueueItem {
  return {
    id: data.id,
    tableId: data.table.id,
    tableName: data.table.name,
    createdAt: data.created_at,
  };
}

type ApiStoreMember = {
  id: string;
  role: string | null;
  service_fee_percent: string | number | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    document: string | null;
  };
};

function mapStoreMember(data: ApiStoreMember): StoreMember {
  return {
    id: data.id,
    role: data.role,
    serviceFeePercent:
      data.service_fee_percent === null || data.service_fee_percent === undefined
        ? null
        : Number(data.service_fee_percent),
    user: data.user,
  };
}

type ApiAppointmentItem = {
  id: string;
  product_id: string | null;
  product_name_snapshot: string;
  duration_minutes_snapshot: number | null;
  is_schedulable_snapshot: boolean;
  sort_order: number;
};

type ApiAppointment = {
  id: string;
  store_id: string;
  location_id: string;
  location: { id: string; name: string };
  customer_id: string;
  customer: { id: string; name: string | null; email: string };
  status: AppointmentStatus;
  is_estimate_request: boolean;
  starts_at: string | null;
  ends_at: string | null;
  estimated_completion_at: string | null;
  customer_notes: string | null;
  producer_notes: string | null;
  created_at: string;
  items: ApiAppointmentItem[];
};

function mapAppointment(data: ApiAppointment): Appointment {
  return {
    id: data.id,
    storeId: data.store_id,
    locationId: data.location_id,
    locationName: data.location.name,
    customerId: data.customer_id,
    customerName: data.customer?.name ?? null,
    customerEmail: data.customer?.email ?? null,
    status: data.status,
    isEstimateRequest: data.is_estimate_request,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    estimatedCompletionAt: data.estimated_completion_at,
    customerNotes: data.customer_notes,
    producerNotes: data.producer_notes,
    createdAt: data.created_at,
    items: (data.items ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        productId: item.product_id,
        productNameSnapshot: item.product_name_snapshot,
        durationMinutesSnapshot: item.duration_minutes_snapshot,
        isSchedulableSnapshot: item.is_schedulable_snapshot,
        sortOrder: item.sort_order,
      })),
  };
}

type ApiAvailabilitySlot = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

function mapAvailabilitySlot(data: ApiAvailabilitySlot): LocationAvailabilitySlot {
  return {
    id: data.id,
    dayOfWeek: data.day_of_week as DayOfWeek,
    startTime: data.start_time,
    endTime: data.end_time,
  };
}

export const producerService = {
  /**
   * Cria a loja para o usuário já autenticado (2a etapa do cadastro, ou
   * fluxo "conta sem loja ainda" no login) - mesma chamada usada pelo
   * app mobile em CreateStoreMutation/create-store.tsx. Depende de o token
   * já ter sido persistido (via ProducerAuthProvider.signIn) antes de
   * chamar isso, pra authHeaders() conseguir montar o Authorization.
   */
  async createStore(dto: CreateStoreDto): Promise<AuthenticatedStoreSummary> {
    const payload = {
      name: dto.name,
      offering_type: dto.offeringType,
      ...(dto.isConsumption !== undefined ? { is_consumption: dto.isConsumption } : {}),
      whatsapp: dto.whatsapp,
      accepted_account_terms: dto.acceptedAccountTerms,
    };
    const { data } = await api.post<ApiStore>("/api/v1/producer/store", payload, {
      headers: authHeaders(),
    });
    return { id: data.id, slug: data.slug, name: data.name };
  },
  async getStore(): Promise<ProducerStore> {
    const { data } = await api.get<ApiStore>("/api/v1/producer/store", {
      headers: authHeaders(),
    });
    return mapStore(data);
  },
  async updateStore(dto: UpdateStoreDto): Promise<ProducerStore> {
    const payload = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.offeringType !== undefined ? { offering_type: dto.offeringType } : {}),
      ...(dto.isConsumption !== undefined ? { is_consumption: dto.isConsumption } : {}),
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
  async getAccountDeletionStatus(): Promise<{ pending: boolean; scheduledFor: string | null }> {
    const { data } = await api.get<{ pending: boolean; scheduled_for?: string }>(
      "/api/v1/account/deletion-request",
      { headers: authHeaders() },
    );
    return { pending: data.pending, scheduledFor: data.scheduled_for ?? null };
  },
  async requestAccountDeletion(password: string): Promise<void> {
    await api.post("/api/v1/account/deletion-request", { password }, { headers: authHeaders() });
  },
  async cancelAccountDeletion(): Promise<void> {
    await api.post("/api/v1/account/deletion-request/cancel", {}, { headers: authHeaders() });
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
  /**
   * Configuração de Agenda do produto (item_type / is_schedulable /
   * duration_minutes) - endpoint separado da edição comum de produto, mesma
   * separação usada pelo app mobile.
   */
  async updateProductScheduling(
    id: UUID,
    dto: UpdateProductSchedulingDto,
  ): Promise<ProducerProduct> {
    const payload = {
      ...(dto.itemType !== undefined ? { item_type: dto.itemType } : {}),
      ...(dto.isSchedulable !== undefined ? { is_schedulable: dto.isSchedulable } : {}),
      ...(dto.durationMinutes !== undefined ? { duration_minutes: dto.durationMinutes } : {}),
    };
    const { data } = await api.patch<ApiProduct>(
      `/api/v1/producer/products/${id}/scheduling`,
      payload,
      { headers: authHeaders() },
    );
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

  // ---- Mesas (Tables) + Chamados -----------------------------------------

  async listTables(): Promise<ProducerTable[]> {
    const { data } = await api.get<ApiTable[]>("/api/v1/producer/tables", {
      headers: authHeaders(),
    });
    return data.map(mapTable);
  },
  async createTable(dto: CreateTableDto): Promise<void> {
    await api.post(
      "/api/v1/producer/tables",
      { location_id: dto.locationId, name: dto.name },
      { headers: authHeaders() },
    );
  },
  async deleteTable(id: UUID): Promise<void> {
    await api.delete(`/api/v1/producer/tables/${id}`, {
      headers: authHeaders(),
    });
  },
  async assignTableMember(tableId: UUID, storeMemberId: UUID): Promise<void> {
    await api.post(
      `/api/v1/producer/tables/${tableId}/members`,
      { store_member_id: storeMemberId },
      { headers: authHeaders() },
    );
  },
  async unassignTableMember(tableId: UUID, storeMemberId: UUID): Promise<void> {
    await api.delete(`/api/v1/producer/tables/${tableId}/members/${storeMemberId}`, {
      headers: authHeaders(),
    });
  },
  async openTable(id: UUID): Promise<ProducerTable> {
    const { data } = await api.post<ApiTable>(
      `/api/v1/producer/tables/${id}/open`,
      {},
      { headers: authHeaders() },
    );
    return mapTable(data);
  },
  async closeTable(id: UUID): Promise<ProducerTable> {
    const { data } = await api.post<ApiTable>(
      `/api/v1/producer/tables/${id}/close`,
      {},
      { headers: authHeaders() },
    );
    return mapTable(data);
  },
  async listQueue(): Promise<QueueItem[]> {
    const { data } = await api.get<ApiQueueItem[]>("/api/v1/producer/tables/queue", {
      headers: authHeaders(),
    });
    return data.map(mapQueueItem);
  },
  async attendQueueItem(id: UUID): Promise<void> {
    await api.patch(
      `/api/v1/producer/tables/queue/${id}/attend`,
      {},
      { headers: authHeaders() },
    );
  },

  // ---- Equipe (Team / Partners) -------------------------------------------

  async listStoreMembers(): Promise<StoreMember[]> {
    const { data } = await api.get<ApiStoreMember[]>("/api/v1/producer/store-members", {
      headers: authHeaders(),
    });
    return data.map(mapStoreMember);
  },
  async linkStoreMember(dto: LinkStoreMemberDto): Promise<StoreMember> {
    const { data } = await api.post<ApiStoreMember>(
      "/api/v1/producer/store-members",
      {
        document: dto.document,
        ...(dto.role ? { role: dto.role } : {}),
        service_fee_percent: dto.serviceFeePercent,
      },
      { headers: authHeaders() },
    );
    return mapStoreMember(data);
  },
  async updateStoreMemberServiceFee(id: UUID, serviceFeePercent: number): Promise<StoreMember> {
    const { data } = await api.patch<ApiStoreMember>(
      `/api/v1/producer/store-members/${id}`,
      { service_fee_percent: serviceFeePercent },
      { headers: authHeaders() },
    );
    return mapStoreMember(data);
  },
  async removeStoreMember(id: UUID): Promise<void> {
    await api.delete(`/api/v1/producer/store-members/${id}`, {
      headers: authHeaders(),
    });
  },

  // ---- Agenda (Appointments + Availability) -------------------------------

  async listAppointments(params: ListAppointmentsParams = {}): Promise<Appointment[]> {
    const { data } = await api.get<ApiAppointment[]>("/api/v1/producer/appointments", {
      params: {
        from: params.from,
        to: params.to,
        status: params.status,
        locationId: params.locationId,
      },
      headers: authHeaders(),
    });
    return data.map(mapAppointment);
  },
  async confirmAppointment(id: UUID, estimatedCompletionAt?: string): Promise<Appointment> {
    const { data } = await api.patch<ApiAppointment>(
      `/api/v1/producer/appointments/${id}/confirm`,
      estimatedCompletionAt ? { estimated_completion_at: estimatedCompletionAt } : {},
      { headers: authHeaders() },
    );
    return mapAppointment(data);
  },
  async rejectAppointment(id: UUID, producerNotes?: string): Promise<Appointment> {
    const { data } = await api.patch<ApiAppointment>(
      `/api/v1/producer/appointments/${id}/reject`,
      producerNotes ? { producer_notes: producerNotes } : {},
      { headers: authHeaders() },
    );
    return mapAppointment(data);
  },
  async getLocationAvailability(locationId: UUID): Promise<LocationAvailabilitySlot[]> {
    const { data } = await api.get<ApiAvailabilitySlot[]>(
      `/api/v1/producer/locations/${locationId}/availability`,
      { headers: authHeaders() },
    );
    return data.map(mapAvailabilitySlot);
  },
  /**
   * Substitui a lista inteira de turnos de uma vez - o backend não tem
   * endpoint de criar/editar/remover turno a turno.
   */
  async replaceLocationAvailability(
    locationId: UUID,
    slots: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }[],
  ): Promise<LocationAvailabilitySlot[]> {
    const { data } = await api.put<ApiAvailabilitySlot[]>(
      `/api/v1/producer/locations/${locationId}/availability`,
      {
        slots: slots.map((slot) => ({
          day_of_week: slot.dayOfWeek,
          start_time: slot.startTime,
          end_time: slot.endTime,
        })),
      },
      { headers: authHeaders() },
    );
    return data.map(mapAvailabilitySlot);
  },
};
