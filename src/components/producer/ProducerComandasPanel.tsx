import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import {
  ProducerCard,
  ProducerGrid,
  ProducerMuted,
  ProducerSectionTitle,
  ProducerStack,
} from "@/components/producer/ProducerUI";
import {
  useCloseProducerComandaMutation,
  useProducerComandaQuery,
  useProducerComandaReportQuery,
  useProducerComandasQuery,
} from "@/hooks/useProducerComandas";
import { useCloseProducerTableMutation } from "@/hooks/useProducerTables";
import type { ComandaDetail, ComandaReport, ComandaSummary } from "@/types/producer";
import { parseApiMessage } from "@/utils/apiMessage";
import { formatPrice } from "@/utils/format";

type Tab = "OPEN" | "CLOSED";
type Preset = "today" | "7d" | "30d";

const PRESETS: { value: Preset; label: string; days: number }[] = [
  { value: "today", label: "Hoje", days: 0 },
  { value: "7d", label: "7 dias", days: 6 },
  { value: "30d", label: "30 dias", days: 29 },
];

function rangeFor(days: number) {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - days);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

function elapsed(iso: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDiscount(type: "PERCENT" | "AMOUNT", value: number): string {
  return type === "PERCENT" ? `${String(value).replace(".", ",")}%` : formatPrice(value);
}

const FORGOTTEN_MS = 12 * 3_600_000;

const cardStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: 12,
  backgroundColor: "#212125",
  display: "grid",
  gap: 6,
} as const;

function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={option.value === value ? "primary" : "secondary"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ opacity: strong ? 1 : 0.75, fontWeight: strong ? 700 : 400 }}>{label}</span>
      <span style={{ fontWeight: strong ? 700 : 400 }}>{value}</span>
    </div>
  );
}

function BucketLines({ bucket }: { bucket: ComandaReport["general"] }) {
  return (
    <>
      <Line label="Vendas (já com desconto)" value={formatPrice(bucket.sales)} strong />
      <Line label="Taxa de serviço a repassar" value={formatPrice(bucket.serviceFee)} strong />
      <Line label="Descontos dados" value={formatPrice(bucket.discounts)} />
      <Line label="Comandas" value={String(bucket.comandas)} />
      <Line label="Ticket médio" value={formatPrice(bucket.averageTicket)} />
      {bucket.feeWaived > 0 ? (
        <ProducerMuted>
          {bucket.feeWaived} comanda(s) sem taxa de serviço (retirada no fechamento).
        </ProducerMuted>
      ) : null}
    </>
  );
}

function ReportSection({ report }: { report: ComandaReport }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <article style={cardStyle}>
        <strong>Resumo do período</strong>
        {report.general.comandas === 0 ? (
          <ProducerMuted>Nenhuma comanda fechada nesse período.</ProducerMuted>
        ) : (
          <BucketLines bucket={report.general} />
        )}
      </article>
      {report.byWaiter.map((waiter) => (
        <article key={waiter.memberId ?? `name:${waiter.name}`} style={cardStyle}>
          <strong>{waiter.name}</strong>
          <BucketLines bucket={waiter} />
        </article>
      ))}
    </div>
  );
}

function ComandaDetailCard({ comanda }: { comanda: ComandaDetail }) {
  const close = useCloseProducerComandaMutation();
  const closeTable = useCloseProducerTableMutation();
  const isOpen = comanda.status === "OPEN";
  const { totals } = comanda;

  const onClose = async () => {
    if (!window.confirm("Fechar esta comanda esquecida? Fica registrado que quem fechou foi você."))
      return;
    const applyServiceFee = window.confirm(
      `Cobrar a taxa de serviço?\n\nOK = com taxa (${formatPrice(
        totals.subtotal + totals.serviceFee,
      )})\nCancelar = sem taxa (${formatPrice(totals.subtotal)})`,
    );

    try {
      await close.mutateAsync({ id: comanda.id, applyServiceFee });
      toast.success("Comanda fechada.");
      if (
        comanda.tableId &&
        window.confirm("Fechar a mesa também? O QR atual deixa de funcionar.")
      ) {
        await closeTable.mutateAsync(comanda.tableId);
        toast.success("Mesa fechada.");
      }
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  return (
    <ProducerCard>
      <ProducerSectionTitle>{`Comanda · ${comanda.tableName}`}</ProducerSectionTitle>
      <ProducerMuted>
        {`Garçom: ${comanda.responsibleName} · taxa ${String(comanda.serviceFeePercent).replace(".", ",")}%`}
      </ProducerMuted>
      <ProducerMuted>
        {isOpen
          ? `Aberta em ${formatDateTime(comanda.openedAt)}`
          : `Fechada em ${comanda.closedAt ? formatDateTime(comanda.closedAt) : "-"}${
              comanda.closedByName ? ` por ${comanda.closedByName}` : ""
            }`}
      </ProducerMuted>

      <div style={{ display: "grid", gap: 8, margin: "12px 0" }}>
        {comanda.items.length === 0 ? <ProducerMuted>Nenhum item lançado.</ProducerMuted> : null}
        {comanda.items.map((item) => {
          const canceled = item.status === "CANCELED";
          return (
            <article key={item.id} style={{ ...cardStyle, opacity: canceled ? 0.65 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong style={{ textDecoration: canceled ? "line-through" : "none" }}>
                  {`${item.quantity}× ${item.name}`}
                </strong>
                <span style={{ textDecoration: canceled ? "line-through" : "none" }}>
                  {formatPrice(canceled ? item.lineGross : item.lineNet)}
                </span>
              </div>
              {item.notes ? <ProducerMuted>{item.notes}</ProducerMuted> : null}
              {item.discount ? (
                <ProducerMuted style={{ color: "#2F9E44" }}>
                  {`Desconto ${formatDiscount(item.discount.type, item.discount.value)}${
                    item.discount.reason ? ` · ${item.discount.reason}` : ""
                  }`}
                </ProducerMuted>
              ) : null}
              <ProducerMuted>{`Lançado por ${item.addedByName ?? "-"}`}</ProducerMuted>
              {canceled ? (
                <ProducerMuted style={{ color: "#EF3E41" }}>
                  {`Cancelado${item.canceledByName ? ` por ${item.canceledByName}` : ""}: ${item.cancelReason ?? ""}`}
                </ProducerMuted>
              ) : null}
            </article>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: 4 }}>
        <Line label="Itens" value={formatPrice(totals.gross)} />
        {totals.discountTotal > 0 ? (
          <Line label="Descontos" value={`− ${formatPrice(totals.discountTotal)}`} />
        ) : null}
        {comanda.discount ? (
          <ProducerMuted>
            {`Desconto da comanda: ${formatDiscount(comanda.discount.type, comanda.discount.value)}${
              comanda.discount.reason ? ` · ${comanda.discount.reason}` : ""
            }${comanda.discount.byName ? ` (${comanda.discount.byName})` : ""}`}
          </ProducerMuted>
        ) : null}
        <Line label="Subtotal" value={formatPrice(totals.subtotal)} />
        <Line
          label={`Taxa de serviço (${String(comanda.serviceFeePercent).replace(".", ",")}%)`}
          value={comanda.serviceFeeApplied ? formatPrice(totals.serviceFee) : "não cobrada"}
        />
        <Line label="Total" value={formatPrice(totals.total)} strong />
      </div>

      {isOpen ? (
        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          <ProducerMuted>
            Você acompanha a comanda; quem lança e fecha é o garçom. Use o botão abaixo só se o
            garçom não puder fechar.
          </ProducerMuted>
          <div>
            <Button variant="secondary" onClick={onClose} disabled={close.isPending}>
              {close.isPending ? "Fechando..." : "Fechar comanda esquecida"}
            </Button>
          </div>
        </div>
      ) : null}
    </ProducerCard>
  );
}

function ComandaRow({
  item,
  now,
  selected,
  onSelect,
}: {
  item: ComandaSummary;
  now: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const forgotten =
    item.status === "OPEN" && now - new Date(item.openedAt).getTime() >= FORGOTTEN_MS;
  return (
    <article style={{ ...cardStyle, outline: selected ? "2px solid #403FB9" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <strong>{item.tableName}</strong>
        <strong>{formatPrice(item.total)}</strong>
      </div>
      <ProducerMuted>{`Garçom: ${item.responsibleName}`}</ProducerMuted>
      <ProducerMuted>
        {item.status === "OPEN"
          ? `Aberta há ${elapsed(item.openedAt, now)} · ${item.itemCount} item(ns)`
          : `Fechada em ${item.closedAt ? formatDateTime(item.closedAt) : "-"} · ${item.itemCount} item(ns)`}
      </ProducerMuted>
      {forgotten ? (
        <ProducerMuted style={{ color: "#EF3E41", fontWeight: 600 }}>
          Aberta há muito tempo. Alguém esqueceu de fechar?
        </ProducerMuted>
      ) : null}
      <div>
        <Button size="sm" variant="ghost" onClick={onSelect}>
          Ver detalhes
        </Button>
      </div>
    </article>
  );
}

export function ProducerComandasPanel() {
  const [tab, setTab] = useState<Tab>("OPEN");
  const [preset, setPreset] = useState<Preset>("today");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const range = useMemo(
    () => rangeFor(PRESETS.find((p) => p.value === preset)?.days ?? 0),
    [preset],
  );
  const filter =
    tab === "OPEN" ? { status: "OPEN" as const } : { status: "CLOSED" as const, ...range };

  const list = useProducerComandasQuery(filter);
  const report = useProducerComandaReportQuery(range);
  const detail = useProducerComandaQuery(selectedId);

  return (
    <ProducerStack>
      <ProducerGrid>
        <ProducerCard>
          <ProducerSectionTitle>Comandas</ProducerSectionTitle>
          <div style={{ display: "grid", gap: 12 }}>
            <Pills
              options={[
                { value: "OPEN" as Tab, label: "Abertas" },
                { value: "CLOSED" as Tab, label: "Histórico" },
              ]}
              value={tab}
              onChange={(value) => {
                setTab(value);
                setSelectedId(null);
              }}
            />
            {tab === "CLOSED" ? (
              <>
                <Pills
                  options={PRESETS.map((p) => ({ value: p.value, label: p.label }))}
                  value={preset}
                  onChange={setPreset}
                />
                {report.isPending ? (
                  <ProducerMuted>Carregando relatório...</ProducerMuted>
                ) : report.data ? (
                  <ReportSection report={report.data} />
                ) : (
                  <ProducerMuted>Não foi possível carregar o relatório.</ProducerMuted>
                )}
              </>
            ) : null}

            {list.isPending ? (
              <ProducerMuted>Carregando...</ProducerMuted>
            ) : list.isError ? (
              <ProducerMuted>Não foi possível carregar as comandas.</ProducerMuted>
            ) : (list.data ?? []).length === 0 ? (
              <ProducerMuted>
                {tab === "OPEN"
                  ? "Nenhuma comanda aberta agora."
                  : "Nenhuma comanda fechada nesse período."}
              </ProducerMuted>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {(list.data ?? []).map((item) => (
                  <ComandaRow
                    key={item.id}
                    item={item}
                    now={now}
                    selected={item.id === selectedId}
                    onSelect={() => setSelectedId(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </ProducerCard>

        {selectedId && detail.data ? (
          <ComandaDetailCard comanda={detail.data} />
        ) : (
          <ProducerCard>
            <ProducerSectionTitle>Detalhes</ProducerSectionTitle>
            <ProducerMuted>
              {selectedId && detail.isPending
                ? "Carregando..."
                : "Selecione uma comanda para ver os itens, quem lançou e os descontos."}
            </ProducerMuted>
          </ProducerCard>
        )}
      </ProducerGrid>
    </ProducerStack>
  );
}
