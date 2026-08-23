// Helpers de data pra tela de Agenda (Produtor), portados 1:1 de
// mostra-ai-mobile/src/utils/date.ts. Nota importante: o backend trata
// starts_at/ends_at como um "horário de parede" gravado em UTC, sem
// conversão real de fuso (ver comentário em mostra-ai-server/src/public/
// store.service.ts). Por isso, ao LER um horário devolvido pela API, usamos
// sempre getUTC*/toISOString com "Z" (não o fuso local do navegador) -
// senão o fuso do dispositivo desloca o horário exibido. Os limites de
// dia/semana/mês do período selecionado, por outro lado, usam o calendário
// local do navegador, porque é isso que a pessoa vendo a tela espera dizer
// "hoje".

export type AgendaPeriod = "day" | "week" | "month";

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Domingo como início de semana - mesmo padrão do day_of_week (0-6) do backend. */
function startOfWeek(date: Date): Date {
  const copy = startOfDay(date);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth() + 1, 0);

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPeriodRange(period: AgendaPeriod, anchor: Date): { from: string; to: string } {
  if (period === "day") {
    const day = startOfDay(anchor);
    return { from: toDateParam(day), to: toDateParam(day) };
  }
  if (period === "week") {
    const start = startOfWeek(anchor);
    const end = addDays(start, 6);
    return { from: toDateParam(start), to: toDateParam(end) };
  }
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  return { from: toDateParam(start), to: toDateParam(end) };
}

export function shiftAnchor(period: AgendaPeriod, anchor: Date, direction: 1 | -1): Date {
  if (period === "day") return addDays(anchor, direction);
  if (period === "week") return addDays(anchor, direction * 7);
  return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
}

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTH_LABELS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatPeriodLabel(period: AgendaPeriod, anchor: Date): string {
  if (period === "day") {
    return `${WEEKDAY_LABELS[anchor.getDay()]}, ${anchor.getDate()} de ${MONTH_LABELS[anchor.getMonth()]}`;
  }
  if (period === "week") {
    const start = startOfWeek(anchor);
    const end = addDays(start, 6);
    const sameMonth = start.getMonth() === end.getMonth();
    return sameMonth
      ? `${start.getDate()} - ${end.getDate()} de ${MONTH_LABELS[start.getMonth()]}`
      : `${start.getDate()} de ${MONTH_LABELS[start.getMonth()]} - ${end.getDate()} de ${MONTH_LABELS[end.getMonth()]}`;
  }
  return `${MONTH_LABELS[anchor.getMonth()]} de ${anchor.getFullYear()}`;
}

/** Título de seção pra um dia (aceita "YYYY-MM-DD" ou um ISO completo). */
export function formatDayHeading(isoDate: string): string {
  const date = new Date(isoDate.length === 10 ? `${isoDate}T00:00:00` : isoDate);
  return `${WEEKDAY_LABELS[date.getDay()]}, ${date.getDate()} de ${MONTH_LABELS[date.getMonth()]}`;
}

/** HH:mm a partir de um ISODateString - lê em UTC, ver nota no topo do arquivo. */
export function formatAgendaTime(isoDateString: string): string {
  const date = new Date(isoDateString);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Converte "dd/mm/aaaa" + "hh:mm" digitados pelo produtor num ISODateString,
 * tratando o valor digitado como o "horário de parede" a ser gravado em UTC
 * (mesma convenção usada em toda a Agenda - ver nota no topo do arquivo).
 * Retorna null se qualquer uma das partes for inválida.
 */
export function parseBrazilianDateTimeToIso(dateText: string, timeText: string): string | null {
  const dateMatch = dateText.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const timeMatch = timeText.trim().match(/^(\d{2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) return null;

  const [, day, month, year] = dateMatch;
  const [, hours, minutes] = timeMatch;

  const dayNum = Number(day);
  const monthNum = Number(month);
  const hoursNum = Number(hours);
  const minutesNum = Number(minutes);

  if (monthNum < 1 || monthNum > 12) return null;
  if (dayNum < 1 || dayNum > 31) return null;
  if (hoursNum > 23 || minutesNum > 59) return null;

  const iso = `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;

  return iso;
}

/** Chave YYYY-MM-DD (em UTC) usada pra agrupar agendamentos por dia. */
export function toUtcDateKey(isoDateString: string): string {
  const date = new Date(isoDateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
