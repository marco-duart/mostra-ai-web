import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { FieldGroup, FieldLabel, Input } from "@/components/ui/Input";
import { ProducerShell } from "@/components/producer/ProducerShell";
import {
  ProducerCard,
  ProducerMuted,
  ProducerPageHero,
  ProducerSectionTitle,
  ProducerStack,
} from "@/components/producer/ProducerUI";
import { useProducerLocationsQuery } from "@/hooks/useProducerLocations";
import { useProducerStoreQuery } from "@/hooks/useProducerStore";
import {
  useConfirmProducerAppointmentMutation,
  useProducerAppointmentsQuery,
  useProducerAvailabilityQuery,
  useRejectProducerAppointmentMutation,
  useReplaceProducerAvailabilityMutation,
} from "@/hooks/useProducerAgenda";
import {
  formatAgendaTime,
  formatDayHeading,
  formatPeriodLabel,
  getPeriodRange,
  parseBrazilianDateTimeToIso,
  shiftAnchor,
  toUtcDateKey,
  type AgendaPeriod,
} from "@/utils/agenda";
import type { Appointment, AppointmentStatus, DayOfWeek } from "@/types/producer";

function parseApiMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Não foi possível concluir agora.";
  const body = err.response?.data as { message?: string | { message?: string | string[] } };
  if (typeof body?.message === "string") return body.message;
  if (typeof body?.message === "object") {
    if (Array.isArray(body.message.message)) return body.message.message[0] ?? "Dados inválidos.";
    if (typeof body.message.message === "string") return body.message.message;
  }
  return err.message || "Erro inesperado.";
}

const PERIOD_OPTIONS: { value: AgendaPeriod; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
];

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  REJECTED: "Rejeitado",
  CANCELED: "Cancelado",
  COMPLETED: "Concluído",
};

const cardStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: 12,
  backgroundColor: "#212125",
  display: "grid",
  gap: 8,
} as const;

function EstimateConfirmForm({
  loading,
  onCancel,
  onConfirm,
}: {
  loading: boolean;
  onCancel: () => void;
  onConfirm: (isoDate: string) => void;
}) {
  const [dateText, setDateText] = useState("");
  const [timeText, setTimeText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const iso = parseBrazilianDateTimeToIso(dateText, timeText);
    if (!iso) {
      setError("Informe uma data (dd/mm/aaaa) e hora (hh:mm) válidas.");
      return;
    }
    setError(null);
    onConfirm(iso);
  };

  return (
    <div style={{ display: "grid", gap: 8, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8 }}>
      <ProducerMuted>
        Pedido de orçamento/prazo - informe a data prevista de conclusão para o cliente.
      </ProducerMuted>
      <div style={{ display: "flex", gap: 8 }}>
        <Input placeholder="dd/mm/aaaa" value={dateText} onChange={(e) => setDateText(e.target.value)} />
        <Input placeholder="hh:mm" value={timeText} onChange={(e) => setTimeText(e.target.value)} />
      </div>
      {error ? <span style={{ color: "#f87171", fontSize: 13 }}>{error}</span> : null}
      <div style={{ display: "flex", gap: 8 }}>
        <Button size="sm" onClick={submit} disabled={loading}>
          {loading ? "Confirmando..." : "Confirmar orçamento"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment,
  onConfirm,
  onReject,
  confirmPending,
}: {
  appointment: Appointment;
  onConfirm: (appointment: Appointment, estimatedCompletionAt?: string) => void;
  onReject: (appointment: Appointment) => void;
  confirmPending: boolean;
}) {
  const [confirmingEstimate, setConfirmingEstimate] = useState(false);

  return (
    <article style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>
          {appointment.isEstimateRequest
            ? "Pedido de orçamento"
            : appointment.startsAt
              ? `${formatAgendaTime(appointment.startsAt)}${
                  appointment.endsAt ? ` - ${formatAgendaTime(appointment.endsAt)}` : ""
                }`
              : "Horário a definir"}
        </strong>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
          {STATUS_LABEL[appointment.status]}
        </span>
      </div>
      <ProducerMuted>{appointment.locationName}</ProducerMuted>
      <span>{appointment.customerName?.trim() || appointment.customerEmail || "Cliente"}</span>
      <ProducerMuted>
        {appointment.items.map((item) => item.productNameSnapshot).join(", ")}
      </ProducerMuted>
      {appointment.customerNotes ? (
        <ProducerMuted>Obs. do cliente: {appointment.customerNotes}</ProducerMuted>
      ) : null}
      {appointment.status === "CONFIRMED" &&
      appointment.isEstimateRequest &&
      appointment.estimatedCompletionAt ? (
        <ProducerMuted>
          Prazo estimado: {new Date(appointment.estimatedCompletionAt).toLocaleString("pt-BR")}
        </ProducerMuted>
      ) : null}

      {appointment.status === "PENDING" ? (
        confirmingEstimate ? (
          <EstimateConfirmForm
            loading={confirmPending}
            onCancel={() => setConfirmingEstimate(false)}
            onConfirm={(iso) => {
              onConfirm(appointment, iso);
              setConfirmingEstimate(false);
            }}
          />
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <Button
              size="sm"
              onClick={() =>
                appointment.isEstimateRequest ? setConfirmingEstimate(true) : onConfirm(appointment)
              }
            >
              Confirmar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onReject(appointment)}>
              Rejeitar
            </Button>
          </div>
        )
      ) : null}
    </article>
  );
}

function AppointmentsSection() {
  const [period, setPeriod] = useState<AgendaPeriod>("week");
  const [anchor, setAnchor] = useState(() => new Date());

  const range = useMemo(() => getPeriodRange(period, anchor), [period, anchor]);
  const list = useProducerAppointmentsQuery(range);
  const confirm = useConfirmProducerAppointmentMutation();
  const reject = useRejectProducerAppointmentMutation();

  const sections = useMemo(() => {
    const appointments = list.data ?? [];
    const byDay = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      const key = toUtcDateKey(appointment.startsAt ?? appointment.createdAt);
      const bucket = byDay.get(key) ?? [];
      bucket.push(appointment);
      byDay.set(key, bucket);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, data]) => ({ title: formatDayHeading(dateKey), data }));
  }, [list.data]);

  const handleConfirm = async (appointment: Appointment, estimatedCompletionAt?: string) => {
    try {
      await confirm.mutateAsync({ id: appointment.id, estimatedCompletionAt });
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const handleReject = async (appointment: Appointment) => {
    if (!window.confirm("Rejeitar agendamento? O cliente será avisado.")) return;
    try {
      await reject.mutateAsync({ id: appointment.id });
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  return (
    <ProducerCard>
      <ProducerSectionTitle>Agendamentos</ProducerSectionTitle>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {PERIOD_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={option.value === period ? "primary" : "secondary"}
            onClick={() => setPeriod(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Button size="sm" variant="ghost" onClick={() => setAnchor((current) => shiftAnchor(period, current, -1))}>
          ‹
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setAnchor(new Date())}>
          {formatPeriodLabel(period, anchor)}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setAnchor((current) => shiftAnchor(period, current, 1))}>
          ›
        </Button>
      </div>

      {list.isPending ? (
        <ProducerMuted>Carregando agendamentos...</ProducerMuted>
      ) : list.isError ? (
        <ProducerMuted>Não foi possível carregar os agendamentos.</ProducerMuted>
      ) : sections.length === 0 ? (
        <ProducerMuted>Nenhum agendamento neste período.</ProducerMuted>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {sections.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#a1a1aa",
                  marginBottom: 8,
                }}
              >
                {section.title}
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {section.data.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                    confirmPending={confirm.isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ProducerCard>
  );
}

const DAY_LABELS: { value: DayOfWeek; label: string }[] = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

type DraftSlot = { dayOfWeek: DayOfWeek; startTime: string; endTime: string };

function AvailabilitySection() {
  const locationsQuery = useProducerLocationsQuery();
  const locations = locationsQuery.data ?? [];

  const [selectedLocationId, setSelectedLocationId] = useState("");
  const effectiveLocationId = selectedLocationId || (locations.length === 1 ? locations[0].id : "");

  const availabilityQuery = useProducerAvailabilityQuery(effectiveLocationId || undefined);
  const replaceAll = useReplaceProducerAvailabilityMutation();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(1);
  const [draft, setDraft] = useState<DraftSlot[]>([]);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!availabilityQuery.data) return;
    setDraft(
      availabilityQuery.data.map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    );
  }, [availabilityQuery.data]);

  const hasChanges = useMemo(() => {
    if (!availabilityQuery.data) return false;
    const original = availabilityQuery.data
      .map((slot) => `${slot.dayOfWeek}|${slot.startTime}|${slot.endTime}`)
      .sort();
    const current = draft.map((slot) => `${slot.dayOfWeek}|${slot.startTime}|${slot.endTime}`).sort();
    return JSON.stringify(original) !== JSON.stringify(current);
  }, [availabilityQuery.data, draft]);

  const slotsForSelectedDay = draft
    .filter((slot) => slot.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const addSlot = () => {
    if (!TIME_PATTERN.test(newStart) || !TIME_PATTERN.test(newEnd)) {
      setFormError("Use o formato hh:mm (ex.: 09:00).");
      return;
    }
    if (newStart >= newEnd) {
      setFormError("O início precisa ser antes do fim.");
      return;
    }
    const overlaps = slotsForSelectedDay.some(
      (slot) => newStart < slot.endTime && slot.startTime < newEnd,
    );
    if (overlaps) {
      setFormError("Esse turno sobrepõe outro já cadastrado nesse dia.");
      return;
    }
    setFormError(null);
    setDraft((current) => [...current, { dayOfWeek: selectedDay, startTime: newStart, endTime: newEnd }]);
    setNewStart("");
    setNewEnd("");
  };

  const removeSlot = (slot: DraftSlot) => {
    setDraft((current) =>
      current.filter(
        (item) =>
          !(item.dayOfWeek === slot.dayOfWeek && item.startTime === slot.startTime && item.endTime === slot.endTime),
      ),
    );
  };

  const save = async () => {
    if (!effectiveLocationId) return;
    try {
      await replaceAll.mutateAsync({ locationId: effectiveLocationId, slots: draft });
      toast.success("Horários de agendamento atualizados.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  return (
    <ProducerCard>
      <ProducerSectionTitle>Horários de agendamento</ProducerSectionTitle>
      <ProducerMuted>
        Diferente do horário de funcionamento - aqui você define quando aceita agendamento, podendo
        ter mais de um turno por dia.
      </ProducerMuted>

      {locations.length === 0 ? (
        <ProducerMuted>Cadastre uma localização antes de configurar horários.</ProducerMuted>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {locations.length > 1 ? (
            <FieldGroup>
              <FieldLabel htmlFor="availability_location">Localização</FieldLabel>
              <select
                id="availability_location"
                value={effectiveLocationId}
                onChange={(event) => setSelectedLocationId(event.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#212125",
                  color: "#f5f5f7",
                }}
              >
                <option value="">Selecione</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </FieldGroup>
          ) : null}

          {!effectiveLocationId ? (
            <ProducerMuted>Escolha uma localização acima.</ProducerMuted>
          ) : availabilityQuery.isPending ? (
            <ProducerMuted>Carregando horários...</ProducerMuted>
          ) : (
            <>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {DAY_LABELS.map((day) => {
                  const count = draft.filter((slot) => slot.dayOfWeek === day.value).length;
                  return (
                    <Button
                      key={day.value}
                      size="sm"
                      variant={day.value === selectedDay ? "primary" : "secondary"}
                      onClick={() => setSelectedDay(day.value)}
                    >
                      {day.label}
                      {count > 0 ? ` (${count})` : ""}
                    </Button>
                  );
                })}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {slotsForSelectedDay.length === 0 ? (
                  <ProducerMuted>Nenhum turno neste dia - o agendamento fica fechado.</ProducerMuted>
                ) : (
                  slotsForSelectedDay.map((slot) => (
                    <div
                      key={`${slot.startTime}-${slot.endTime}`}
                      style={{
                        ...cardStyle,
                        gridTemplateColumns: "1fr auto",
                        display: "grid",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => removeSlot(slot)}>
                        Remover
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div style={cardStyle}>
                <ProducerSectionTitle>Adicionar turno</ProducerSectionTitle>
                <div style={{ display: "flex", gap: 8 }}>
                  <Input placeholder="Início (hh:mm)" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
                  <Input placeholder="Fim (hh:mm)" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
                </div>
                {formError ? <span style={{ color: "#f87171", fontSize: 13 }}>{formError}</span> : null}
                <div>
                  <Button size="sm" variant="secondary" onClick={addSlot}>
                    Adicionar turno
                  </Button>
                </div>
              </div>

              <Button onClick={save} disabled={!hasChanges || replaceAll.isPending}>
                {replaceAll.isPending
                  ? "Salvando..."
                  : hasChanges
                    ? "Salvar horários"
                    : "Nenhuma alteração"}
              </Button>
            </>
          )}
        </div>
      )}
    </ProducerCard>
  );
}

export function ProducerAgendaPage() {
  const storeQuery = useProducerStoreQuery();
  const offeringType = storeQuery.data?.offeringType;
  const offersServices = offeringType === "SERVICE" || offeringType === "BOTH";

  return (
    <ProducerShell>
      <ProducerStack>
        <ProducerCard>
          <ProducerPageHero
            stepLabel="Operação"
            title="Agenda"
            subtitle="Confirme ou rejeite agendamentos e configure os horários em que sua loja aceita reservas."
          />
        </ProducerCard>

        {!offersServices && !storeQuery.isPending ? (
          <ProducerCard>
            <ProducerMuted>
              A Agenda fica disponível quando sua loja oferece Serviços (ou Produtos e Serviços).
              Você pode mudar isso na aba Loja, em &quot;O que você oferece&quot;.
            </ProducerMuted>
          </ProducerCard>
        ) : (
          <>
            <AppointmentsSection />
            <AvailabilitySection />
          </>
        )}
      </ProducerStack>
    </ProducerShell>
  );
}
