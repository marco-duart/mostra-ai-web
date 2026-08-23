import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Info, AlertTriangle, Instagram, MessageCircle } from "lucide-react";
import { styled } from "@/theme/stitches.config";
import { PageContent } from "@/components/layout/PageContent";
import { Section, SectionTitle, Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldError, FieldGroup, FieldLabel, Input, Textarea } from "@/components/ui/Input";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { useStoreCatalog } from "@/hooks/useStoreCatalog";
import { useAvailability } from "@/hooks/useAvailability";
import { useClientRegisterMutation, useCreateAppointmentMutation } from "@/hooks/useClientAppointmentMutations";
import { clearClientSession, getClientToken, getClientUser, setClientSession } from "@/lib/clientAuth";
import { formatWhatsappHref, getStoreThemeVars, instagramHref } from "@/utils/format";
import type { Product } from "@/types/domain";
import type { ClientUserSummary, DocumentType } from "@/types/client";

type ServiceGroup = "schedulable" | "estimate";

const groupOf = (service: Product): ServiceGroup =>
  service.is_schedulable === true ? "schedulable" : "estimate";

const NEXT_DAYS_COUNT = 21;

function nextDays(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    return date;
  });
}

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function dateChipLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMonth = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  if (date.getTime() === today.getTime()) return `Hoje, ${dayMonth}`;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.getTime() === tomorrow.getTime()) return `Amanhã, ${dayMonth}`;
  return `${WEEKDAY_LABELS[date.getDay()]}, ${dayMonth}`;
}

/**
 * Combina data (YYYY-MM-DD) + horário de slot (HH:mm) num ISODateString,
 * tratando ambos como o mesmo "horário de parede" gravado em UTC - mesma
 * convenção usada em todo o resto do sistema (servidor e apps mobile). Ver
 * comentário em mostra-ai-server/src/public/store.service.ts.
 */
function combineDateAndSlotToIso(dateParam: string, slotTime: string): string {
  return `${dateParam}T${slotTime}:00.000Z`;
}

const NEXT_DAYS = nextDays(NEXT_DAYS_COUNT);

const CenterState = styled("div", {
  display: "grid",
  placeItems: "center",
  minHeight: "60dvh",
  padding: "$5",
  textAlign: "center",
  color: "$textMuted",
});

const BackLink = styled(Link, {
  display: "inline-flex",
  fontSize: "$sm",
  color: "$textMuted",
  marginBottom: "$3",
  "&:hover": { color: "$primary" },
});

const NoticeBox = styled("div", {
  display: "flex",
  gap: "$2",
  alignItems: "flex-start",
  padding: "$3 $4",
  borderRadius: "$md",
  backgroundColor: "$surfaceAlt",
  border: "1px solid $border",
  fontSize: "$sm",
  color: "$textMuted",
  marginBottom: "$4",
});

const ServiceRow = styled("label", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "$3",
  padding: "$3 $4",
  borderRadius: "$md",
  border: "1px solid $border",
  backgroundColor: "$surfaceAlt",
  marginBottom: "$2",
  cursor: "pointer",
  variants: {
    disabled: {
      true: { opacity: 0.45, cursor: "not-allowed" },
    },
    selected: {
      true: { borderColor: "$primaryBorder", backgroundColor: "$primarySoft" },
    },
  },
});

const ChipRow = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "$2",
  marginBottom: "$4",
});

const Chip = styled("button", {
  all: "unset",
  boxSizing: "border-box",
  cursor: "pointer",
  padding: "$2 $4",
  borderRadius: "$pill",
  border: "1px solid $border",
  backgroundColor: "$surfaceAlt",
  fontSize: "$sm",
  fontWeight: "$medium",
  color: "$text",
  variants: {
    selected: {
      true: { backgroundColor: "$primary", color: "$primaryContrast", borderColor: "$primary" },
    },
  },
});

const DocTypeRow = styled("div", {
  display: "flex",
  gap: "$2",
  marginBottom: "$4",
});

const CheckboxRow = styled("label", {
  display: "flex",
  alignItems: "flex-start",
  gap: "$2",
  fontSize: "$sm",
  color: "$textMuted",
  marginBottom: "$3",
  cursor: "pointer",
});

const SuccessTitle = styled("h2", {
  margin: 0,
  marginBottom: "$3",
  fontSize: "$xl",
  fontWeight: "$bold",
});

const ContactLinks = styled("div", {
  display: "flex",
  gap: "$2",
  marginTop: "$4",
  flexWrap: "wrap",
});

const ContactLink = styled("a", {
  display: "inline-flex",
  alignItems: "center",
  gap: "$2",
  padding: "$2 $3",
  borderRadius: "$pill",
  backgroundColor: "$surfaceAlt",
  border: "1px solid $border",
  fontSize: "$sm",
  fontWeight: "$medium",
  color: "$text",
});

const SecondaryLinkButton = styled(Link, {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "$3 $5",
  borderRadius: "$md",
  backgroundColor: "$surfaceAlt",
  border: "1px solid $border",
  fontWeight: "$semibold",
  fontSize: "$md",
  color: "$text",
});

/**
 * Fluxo de "Agendar serviço" no site público. Escolhe serviço(s) → (se
 * agendável) localização/data/horário → cadastro inline (se ainda não tem
 * sessão de cliente salva neste navegador) → confirma. Cria sempre com
 * status PENDING - ver ESPECIFICACAO-AGENDA.md em mostra-ai-server.
 */
export function ScheduleServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const catalogState = useStoreCatalog(slug);

  const [session, setSession] = useState<ClientUserSummary | null>(() => getClientUser());

  const [selectedGroup, setSelectedGroup] = useState<ServiceGroup | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState("");

  const [regValues, setRegValues] = useState({
    name: "",
    email: "",
    password: "",
    document: "",
    documentType: "CPF" as DocumentType,
    acceptedAppTerms: false,
    acceptedLgpd: false,
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  const registerMutation = useClientRegisterMutation();
  const createAppointmentMutation = useCreateAppointmentMutation();

  const services = useMemo(
    () =>
      catalogState.status === "success"
        ? catalogState.data.menu.flatMap((c) => c.products).filter((p) => p.item_type === "SERVICE")
        : [],
    [catalogState],
  );
  const locations = catalogState.status === "success" ? catalogState.data.locations : [];

  const effectiveLocationId =
    selectedLocationId ?? (locations.length === 1 ? locations[0].id : null);

  const availability = useAvailability(
    slug,
    selectedGroup === "schedulable" ? effectiveLocationId : null,
    selectedGroup === "schedulable" ? selectedDate : null,
    selectedGroup === "schedulable" ? selectedServiceIds : [],
  );

  useEffect(() => {
    if (catalogState.status === "success") {
      document.title = `Agendar serviço · ${catalogState.data.store.name} — MostraAi`;
    }
  }, [catalogState]);

  const toggleService = (service: Product) => {
    const group = groupOf(service);
    if (selectedGroup && selectedGroup !== group) return;
    setSelectedSlot(null);
    setSelectedServiceIds((current) => {
      const next = current.includes(service.id)
        ? current.filter((id) => id !== service.id)
        : [...current, service.id];
      setSelectedGroup(next.length > 0 ? group : null);
      return next;
    });
  };

  const canSubmit =
    Boolean(effectiveLocationId) &&
    selectedServiceIds.length > 0 &&
    (selectedGroup === "estimate" || (selectedGroup === "schedulable" && Boolean(selectedSlot)));

  const validateRegistration = (): boolean => {
    const errors: Record<string, string> = {};
    if (!regValues.name.trim()) errors.name = "Informe seu nome.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regValues.email)) errors.email = "E-mail inválido.";
    if (regValues.password.length < 6) errors.password = "Mínimo 6 caracteres.";
    if (!regValues.document.trim()) errors.document = "Informe seu CPF ou CNPJ.";
    if (!regValues.acceptedAppTerms || !regValues.acceptedLgpd) {
      errors._global = "É preciso aceitar os termos e a política de privacidade pra continuar.";
    }
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (catalogState.status !== "success" || !effectiveLocationId || !canSubmit) return;
    setGlobalError(null);

    let token = getClientToken();
    let user = session;

    if (!token) {
      if (!validateRegistration()) return;
      try {
        const result = await registerMutation.mutateAsync({
          email: regValues.email.trim(),
          password: regValues.password,
          name: regValues.name.trim(),
          document: regValues.document.trim(),
          documentType: regValues.documentType,
          acceptedAppTerms: regValues.acceptedAppTerms,
          acceptedLgpd: regValues.acceptedLgpd,
        });
        token = result.accessToken;
        user = result.user;
        setClientSession(result.accessToken, result.user);
        setSession(result.user);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          setGlobalError(
            "Este e-mail já tem uma conta MostraAi. Abra o app MostraAi Cliente pra agendar por lá.",
          );
        } else {
          setGlobalError("Não foi possível criar sua conta agora. Verifique os dados e tente de novo.");
        }
        return;
      }
    }

    if (!token) return;

    try {
      const startsAt =
        selectedGroup === "schedulable" && selectedDate && selectedSlot
          ? combineDateAndSlotToIso(selectedDate, selectedSlot)
          : undefined;

      await createAppointmentMutation.mutateAsync({
        token,
        payload: {
          store_id: catalogState.data.store.id,
          location_id: effectiveLocationId,
          service_ids: selectedServiceIds,
          ...(startsAt ? { starts_at: startsAt } : {}),
          ...(customerNotes.trim() ? { customer_notes: customerNotes.trim() } : {}),
        },
      });
      setCreated(true);
    } catch {
      setGlobalError("Não foi possível enviar o agendamento agora. Tente novamente.");
    }
  }

  if (catalogState.status === "loading") {
    return (
      <CenterState>
        <LogoSpinner label="Carregando..." />
      </CenterState>
    );
  }
  if (catalogState.status === "not_found") return <NotFoundPage />;
  if (catalogState.status === "error") {
    return (
      <CenterState>
        <p>Não foi possível carregar esta loja.</p>
      </CenterState>
    );
  }

  const { store } = catalogState.data;
  const themeVars = getStoreThemeVars(
    store.theme_primary_color,
    store.theme_secondary_color,
  ) as React.CSSProperties;

  if (created) {
    return (
      <div style={themeVars}>
        <PageContent>
          <Section>
            <Card>
              <SuccessTitle>
                {selectedGroup === "estimate" ? "Pedido de orçamento enviado!" : "Agendamento solicitado!"}
              </SuccessTitle>
              <p>
                {selectedGroup === "estimate"
                  ? `${store.name} vai avaliar seu pedido e te informar um prazo estimado por e-mail.`
                  : `${store.name} precisa confirmar o horário. Você receberá a confirmação por e-mail.`}
              </p>
              <p>
                <strong>Não é possível cancelar por aqui.</strong> Caso precise cancelar ou alterar,
                fale diretamente com {store.name}.
              </p>
              <ContactLinks>
                {store.whatsapp && (
                  <ContactLink href={formatWhatsappHref(store.whatsapp)} target="_blank" rel="noreferrer">
                    <MessageCircle size={16} /> WhatsApp
                  </ContactLink>
                )}
                {store.instagram && (
                  <ContactLink href={instagramHref(store.instagram)} target="_blank" rel="noreferrer">
                    <Instagram size={16} /> Instagram
                  </ContactLink>
                )}
              </ContactLinks>
              <div style={{ marginTop: 20 }}>
                <SecondaryLinkButton to={`/${slug}`}>Voltar para a loja</SecondaryLinkButton>
              </div>
            </Card>
          </Section>
        </PageContent>
      </div>
    );
  }

  const schedulableServices = services.filter((s) => groupOf(s) === "schedulable");
  const estimateServices = services.filter((s) => groupOf(s) === "estimate");

  return (
    <div style={themeVars}>
      <PageContent>
        <Section>
          <BackLink to={`/${slug}`}>← Voltar para {store.name}</BackLink>
          <SectionTitle>Agendar serviço</SectionTitle>

          <NoticeBox>
            <Info size={18} />
            <span>
              Este agendamento depende da aprovação de {store.name}. Recomendamos agendar com
              antecedência.
            </span>
          </NoticeBox>

          {services.length === 0 ? (
            <Card>
              <p>Esta loja não tem serviços disponíveis para agendamento no momento.</p>
            </Card>
          ) : (
            <form onSubmit={submit} noValidate>
              {locations.length > 1 && (
                <FieldGroup>
                  <FieldLabel>Localização</FieldLabel>
                  {locations.map((location) => (
                    <ServiceRow key={location.id} selected={effectiveLocationId === location.id}>
                      <span>{location.name}</span>
                      <input
                        type="radio"
                        name="location"
                        checked={effectiveLocationId === location.id}
                        onChange={() => setSelectedLocationId(location.id)}
                      />
                    </ServiceRow>
                  ))}
                </FieldGroup>
              )}

              {schedulableServices.length > 0 && (
                <FieldGroup>
                  <FieldLabel>Serviços com horário marcado</FieldLabel>
                  {schedulableServices.map((service) => (
                    <ServiceCheckbox
                      key={service.id}
                      service={service}
                      selected={selectedServiceIds.includes(service.id)}
                      disabled={selectedGroup === "estimate"}
                      onToggle={() => toggleService(service)}
                    />
                  ))}
                </FieldGroup>
              )}

              {estimateServices.length > 0 && (
                <FieldGroup>
                  <FieldLabel>Serviços sob consulta (pedido de orçamento)</FieldLabel>
                  {estimateServices.map((service) => (
                    <ServiceCheckbox
                      key={service.id}
                      service={service}
                      selected={selectedServiceIds.includes(service.id)}
                      disabled={selectedGroup === "schedulable"}
                      onToggle={() => toggleService(service)}
                    />
                  ))}
                </FieldGroup>
              )}

              {selectedGroup === "schedulable" && (
                <FieldGroup>
                  <FieldLabel>Data</FieldLabel>
                  <ChipRow>
                    {NEXT_DAYS.map((date) => {
                      const dateParam = toDateParam(date);
                      return (
                        <Chip
                          key={dateParam}
                          type="button"
                          selected={dateParam === selectedDate}
                          onClick={() => {
                            setSelectedDate(dateParam);
                            setSelectedSlot(null);
                          }}
                        >
                          {dateChipLabel(date)}
                        </Chip>
                      );
                    })}
                  </ChipRow>

                  {selectedDate && (
                    <>
                      <FieldLabel>Horário</FieldLabel>
                      {availability.status === "loading" && <p>Carregando horários...</p>}
                      {availability.status === "success" && availability.data.mode === "slots" && (
                        availability.data.slots.length > 0 ? (
                          <ChipRow>
                            {availability.data.slots.map((slot) => (
                              <Chip
                                key={slot}
                                type="button"
                                selected={slot === selectedSlot}
                                onClick={() => setSelectedSlot(slot)}
                              >
                                {slot}
                              </Chip>
                            ))}
                          </ChipRow>
                        ) : (
                          <p>Nenhum horário livre nesse dia. Tente outra data.</p>
                        )
                      )}
                      {availability.status === "error" && <FieldError>{availability.message}</FieldError>}
                    </>
                  )}
                </FieldGroup>
              )}

              {selectedGroup && (
                <FieldGroup>
                  <FieldLabel htmlFor="customer_notes">Observações (opcional)</FieldLabel>
                  <Textarea
                    id="customer_notes"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    maxLength={500}
                  />
                </FieldGroup>
              )}

              {selectedGroup && !session && !getClientToken() && (
                <Card>
                  <SectionTitle as="h3" css={{ fontSize: "$lg", marginBottom: "$3" }}>
                    Seus dados
                  </SectionTitle>
                  <FieldGroup>
                    <FieldLabel htmlFor="reg_name">Nome completo *</FieldLabel>
                    <Input
                      id="reg_name"
                      value={regValues.name}
                      onChange={(e) => setRegValues((v) => ({ ...v, name: e.target.value }))}
                      maxLength={150}
                    />
                    {regErrors.name && <FieldError>{regErrors.name}</FieldError>}
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="reg_email">E-mail *</FieldLabel>
                    <Input
                      id="reg_email"
                      type="email"
                      value={regValues.email}
                      onChange={(e) => setRegValues((v) => ({ ...v, email: e.target.value }))}
                    />
                    {regErrors.email && <FieldError>{regErrors.email}</FieldError>}
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="reg_password">Senha *</FieldLabel>
                    <Input
                      id="reg_password"
                      type="password"
                      value={regValues.password}
                      onChange={(e) => setRegValues((v) => ({ ...v, password: e.target.value }))}
                    />
                    {regErrors.password && <FieldError>{regErrors.password}</FieldError>}
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Documento *</FieldLabel>
                    <DocTypeRow>
                      <Button
                        type="button"
                        size="sm"
                        variant={regValues.documentType === "CPF" ? "primary" : "secondary"}
                        onClick={() => setRegValues((v) => ({ ...v, documentType: "CPF" }))}
                      >
                        CPF
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={regValues.documentType === "CNPJ" ? "primary" : "secondary"}
                        onClick={() => setRegValues((v) => ({ ...v, documentType: "CNPJ" }))}
                      >
                        CNPJ
                      </Button>
                    </DocTypeRow>
                    <Input
                      id="reg_document"
                      value={regValues.document}
                      onChange={(e) => setRegValues((v) => ({ ...v, document: e.target.value }))}
                      placeholder={regValues.documentType === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"}
                    />
                    {regErrors.document && <FieldError>{regErrors.document}</FieldError>}
                  </FieldGroup>
                  <CheckboxRow>
                    <input
                      type="checkbox"
                      checked={regValues.acceptedAppTerms}
                      onChange={(e) => setRegValues((v) => ({ ...v, acceptedAppTerms: e.target.checked }))}
                    />
                    <span>Li e aceito os termos de uso do MostraAi.</span>
                  </CheckboxRow>
                  <CheckboxRow>
                    <input
                      type="checkbox"
                      checked={regValues.acceptedLgpd}
                      onChange={(e) => setRegValues((v) => ({ ...v, acceptedLgpd: e.target.checked }))}
                    />
                    <span>Li e aceito a política de privacidade (LGPD).</span>
                  </CheckboxRow>
                  {regErrors._global && <FieldError>{regErrors._global}</FieldError>}
                </Card>
              )}

              {session && getClientToken() && (
                <NoticeBox>
                  <Info size={18} />
                  <span>
                    Agendando como {session.name ?? session.email}.{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        clearClientSession();
                        setSession(null);
                      }}
                    >
                      Não é você?
                    </a>
                  </span>
                </NoticeBox>
              )}

              <NoticeBox>
                <AlertTriangle size={18} />
                <span>
                  Não é possível cancelar por aqui. Caso precise cancelar, fale diretamente com{" "}
                  {store.name} (WhatsApp/Instagram no topo da página da loja).
                </span>
              </NoticeBox>

              {globalError && <FieldError>{globalError}</FieldError>}

              <Button
                type="submit"
                size="lg"
                block
                disabled={
                  !canSubmit || registerMutation.isPending || createAppointmentMutation.isPending
                }
              >
                {registerMutation.isPending || createAppointmentMutation.isPending
                  ? "Enviando..."
                  : selectedGroup === "estimate"
                    ? "Enviar pedido de orçamento"
                    : "Solicitar agendamento"}
              </Button>
            </form>
          )}
        </Section>
      </PageContent>
    </div>
  );
}

function ServiceCheckbox({
  service,
  selected,
  disabled,
  onToggle,
}: {
  service: Product;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <ServiceRow selected={selected} disabled={disabled && !selected}>
      <span>
        {service.name}
        {service.duration_minutes ? ` · ${service.duration_minutes} min` : ""}
      </span>
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled && !selected}
        onChange={onToggle}
      />
    </ServiceRow>
  );
}
