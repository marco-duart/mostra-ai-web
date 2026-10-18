import { api } from "@/lib/api";
import { getProducerAccessToken } from "@/contexts/producerAuth";
import type {
  ComandaDetail,
  ComandaFilter,
  ComandaReport,
  ComandaReportBucket,
  ComandaSummary,
  UUID,
} from "@/types/producer";

function authHeaders() {
  const token = getProducerAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type ApiSummary = {
  id: UUID;
  status: ComandaSummary["status"];
  table_id: UUID | null;
  table_name: string;
  responsible_name: string;
  opened_at: string;
  closed_at: string | null;
  item_count: number;
  subtotal: string;
  service_fee: string;
  total: string;
};

type ApiDiscount = { type: "PERCENT" | "AMOUNT"; value: string; reason: string | null } | null;

type ApiDetail = ApiSummary & {
  service_fee_percent: string;
  service_fee_applied: boolean;
  closed_by_name: string | null;
  closed_by_owner: boolean;
  discount: {
    type?: "PERCENT" | "AMOUNT";
    value?: string;
    reason?: string | null;
    by_name: string | null;
  };
  items: {
    id: UUID;
    name: string;
    unit_price: string;
    quantity: number;
    notes: string | null;
    status: "ACTIVE" | "CANCELED";
    discount: ApiDiscount;
    line_gross: string;
    line_discount: string;
    line_net: string;
    added_by_name: string | null;
    canceled_by_name: string | null;
    cancel_reason: string | null;
  }[];
  totals: {
    gross: string;
    item_discounts: string;
    comanda_discount: string;
    discount_total: string;
    subtotal: string;
    service_fee: string;
    total: string;
  };
};

type ApiBucket = {
  comandas: number;
  gross: string;
  sales: string;
  discounts: string;
  service_fee: string;
  total: string;
  average_ticket: string;
  fee_waived: number;
};

function mapSummary(c: ApiSummary): ComandaSummary {
  return {
    id: c.id,
    status: c.status,
    tableId: c.table_id,
    tableName: c.table_name,
    responsibleName: c.responsible_name,
    openedAt: c.opened_at,
    closedAt: c.closed_at,
    itemCount: c.item_count,
    subtotal: Number(c.subtotal),
    serviceFee: Number(c.service_fee),
    total: Number(c.total),
  };
}

const mapDiscount = (d: ApiDiscount) =>
  d ? { type: d.type, value: Number(d.value), reason: d.reason } : null;

function mapDetail(c: ApiDetail): ComandaDetail {
  return {
    ...mapSummary(c),
    serviceFeePercent: Number(c.service_fee_percent),
    serviceFeeApplied: c.service_fee_applied,
    closedByName: c.closed_by_name,
    closedByOwner: c.closed_by_owner,
    discount:
      c.discount.type && c.discount.value !== undefined
        ? {
            type: c.discount.type,
            value: Number(c.discount.value),
            reason: c.discount.reason ?? null,
            byName: c.discount.by_name,
          }
        : null,
    items: c.items.map((i) => ({
      id: i.id,
      name: i.name,
      unitPrice: Number(i.unit_price),
      quantity: i.quantity,
      notes: i.notes,
      status: i.status,
      discount: mapDiscount(i.discount),
      lineGross: Number(i.line_gross),
      lineDiscount: Number(i.line_discount),
      lineNet: Number(i.line_net),
      addedByName: i.added_by_name,
      canceledByName: i.canceled_by_name,
      cancelReason: i.cancel_reason,
    })),
    totals: {
      gross: Number(c.totals.gross),
      itemDiscounts: Number(c.totals.item_discounts),
      comandaDiscount: Number(c.totals.comanda_discount),
      discountTotal: Number(c.totals.discount_total),
      subtotal: Number(c.totals.subtotal),
      serviceFee: Number(c.totals.service_fee),
      total: Number(c.totals.total),
    },
  };
}

function mapBucket(b: ApiBucket): ComandaReportBucket {
  return {
    comandas: b.comandas,
    gross: Number(b.gross),
    sales: Number(b.sales),
    discounts: Number(b.discounts),
    serviceFee: Number(b.service_fee),
    total: Number(b.total),
    averageTicket: Number(b.average_ticket),
    feeWaived: b.fee_waived,
  };
}

export const comandaService = {
  async list(filter: ComandaFilter): Promise<ComandaSummary[]> {
    const { data } = await api.get<ApiSummary[]>("/api/v1/producer/comandas", {
      params: filter,
      headers: authHeaders(),
    });
    return data.map(mapSummary);
  },

  async get(id: UUID): Promise<ComandaDetail> {
    const { data } = await api.get<ApiDetail>(`/api/v1/producer/comandas/${id}`, {
      headers: authHeaders(),
    });
    return mapDetail(data);
  },

  async report(range: { from?: string; to?: string }): Promise<ComandaReport> {
    const { data } = await api.get<{
      period: { from: string; to: string };
      general: ApiBucket;
      by_waiter: (ApiBucket & { member_id: UUID | null; name: string })[];
    }>("/api/v1/producer/comandas/report", { params: range, headers: authHeaders() });
    return {
      from: data.period.from,
      to: data.period.to,
      general: mapBucket(data.general),
      byWaiter: data.by_waiter.map((w) => ({
        ...mapBucket(w),
        memberId: w.member_id,
        name: w.name,
      })),
    };
  },

  async close(id: UUID, applyServiceFee: boolean): Promise<ComandaDetail> {
    const { data } = await api.post<ApiDetail>(
      `/api/v1/producer/comandas/${id}/close`,
      { apply_service_fee: applyServiceFee },
      { headers: authHeaders() },
    );
    return mapDetail(data);
  },
};
