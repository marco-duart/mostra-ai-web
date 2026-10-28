import { api } from "@/lib/api";
import { getProducerAccessToken } from "@/contexts/producerAuth";
import {
  createNovidadesTracker,
  novidadesFrom,
  type Novidade,
  type NovidadeEvent,
} from "@/lib/novidades";

export type ProducerWebPlacement = "producer.web" | "producer.web.novidades";

function authHeaders() {
  const token = getProducerAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function sendEvents(events: NovidadeEvent[]) {
  // keepalive: o envio sobrevive à troca de página.
  void api
    .post(
      "/novidades/events",
      { events },
      { headers: authHeaders(), adapter: "fetch", fetchOptions: { keepalive: true } },
    )
    .catch(() => undefined);
}

const tracker = createNovidadesTracker(sendEvents);
let flushTimer: ReturnType<typeof setTimeout> | undefined;

export const novidadesService = {
  /** Erro ou painel fora = lista vazia; Novidades nunca mostra erro. */
  async list(placement: ProducerWebPlacement): Promise<Novidade[]> {
    try {
      const { data } = await api.get("/novidades", {
        params: { placement },
        headers: authHeaders(),
      });
      return novidadesFrom(data);
    } catch {
      return [];
    }
  },

  impression(announcementId: string, placement: ProducerWebPlacement) {
    if (!tracker.impression(announcementId, placement) || flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = undefined;
      tracker.flush();
    }, 2_000);
  },

  click(announcementId: string, placement: ProducerWebPlacement) {
    tracker.click(announcementId, placement);
    tracker.flush();
  },
};
