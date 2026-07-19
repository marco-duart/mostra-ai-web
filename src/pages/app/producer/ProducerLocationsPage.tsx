import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { FieldGroup, FieldLabel, Input } from "@/components/ui/Input";
import { ProducerShell } from "@/components/producer/ProducerShell";
import {
  ProducerCard,
  ProducerGrid,
  ProducerMuted,
  ProducerPageHero,
  ProducerSectionTitle,
  ProducerStack,
} from "@/components/producer/ProducerUI";
import {
  useActivateProducerLocationMutation,
  useCreateProducerLocationMutation,
  useDeleteProducerLocationMutation,
  useProducerLocationsQuery,
  useUpdateProducerLocationMutation,
} from "@/hooks/useProducerLocations";
import { deliveryModeLabel } from "@/utils/format";
import type { DeliveryMode, ProducerLocation } from "@/types/producer";

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

type Draft = {
  id?: string;
  name: string;
  address: string;
  googleMapsUrl: string;
  deliveryMode: DeliveryMode;
};

const emptyDraft: Draft = {
  name: "",
  address: "",
  googleMapsUrl: "",
  deliveryMode: "BOTH",
};

function fromLocation(location: ProducerLocation): Draft {
  return {
    id: location.id,
    name: location.name,
    address: location.address,
    googleMapsUrl: location.googleMapsUrl,
    deliveryMode: location.deliveryMode,
  };
}

export function ProducerLocationsPage() {
  const locationsQuery = useProducerLocationsQuery();
  const createLocation = useCreateProducerLocationMutation();
  const updateLocation = useUpdateProducerLocationMutation();
  const deleteLocation = useDeleteProducerLocationMutation();
  const activateLocation = useActivateProducerLocationMutation();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const sortedLocations = useMemo(
    () => [...(locationsQuery.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [locationsQuery.data],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (draft.name.trim().length < 2 || draft.address.trim().length < 5) {
      toast.error("Preencha nome e endereço válidos.");
      return;
    }

    const payload = {
      name: draft.name.trim(),
      address: draft.address.trim(),
      googleMapsUrl: draft.googleMapsUrl.trim(),
      deliveryMode: draft.deliveryMode,
    };

    try {
      if (draft.id) {
        await updateLocation.mutateAsync({ id: draft.id, dto: payload });
        toast.success("Local atualizado.");
      } else {
        await createLocation.mutateAsync(payload);
        toast.success("Local criado.");
      }
      setDraft(emptyDraft);
      setEditing(false);
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Remover este local?")) return;
    try {
      await deleteLocation.mutateAsync(id);
      toast.success("Local removido.");
      if (draft.id === id) {
        setDraft(emptyDraft);
        setEditing(false);
      }
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onActivate = async (id: string) => {
    try {
      await activateLocation.mutateAsync(id);
      toast.success("Local ativo atualizado.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  return (
    <ProducerShell>
      <ProducerStack>
        <ProducerCard>
          <ProducerPageHero
            stepLabel="Operação"
            title="Locais"
            subtitle="Gerencie pontos de atendimento e marque o local ativo para abertura do catálogo."
          />
        </ProducerCard>

        <ProducerGrid>
          <ProducerCard>
            <ProducerSectionTitle>Seus locais</ProducerSectionTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDraft(emptyDraft);
                setEditing(true);
              }}
            >
              Novo local
            </Button>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {sortedLocations.length === 0 ? (
                <ProducerMuted>Nenhum local cadastrado.</ProducerMuted>
              ) : (
                sortedLocations.map((location) => (
                  <article
                    key={location.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: 12,
                      backgroundColor: "#212125",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <strong>{location.name}</strong>
                    <ProducerMuted>{location.address}</ProducerMuted>
                    <ProducerMuted>Modo: {deliveryModeLabel(location.deliveryMode)}</ProducerMuted>
                    <ProducerMuted>Status: {location.isOpenNow ? "Aberto" : "Fechado"}</ProducerMuted>
                    <ProducerMuted>
                      Local ativo: {location.isCurrentActive ? "Sim" : "Não"}
                    </ProducerMuted>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setDraft(fromLocation(location));
                        setEditing(true);
                      }}>
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onActivate(location.id)}>
                        Ativar
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onDelete(location.id)}>
                        Remover
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </ProducerCard>

          <ProducerCard>
            <ProducerSectionTitle>{draft.id ? "Editar local" : "Novo local"}</ProducerSectionTitle>
            {editing ? (
              <form onSubmit={onSubmit}>
                <FieldGroup>
                  <FieldLabel htmlFor="location_name">Nome</FieldLabel>
                  <Input
                    id="location_name"
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="location_address">Endereço</FieldLabel>
                  <Input
                    id="location_address"
                    value={draft.address}
                    onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="location_maps">Link do Google Maps</FieldLabel>
                  <Input
                    id="location_maps"
                    value={draft.googleMapsUrl}
                    onChange={(event) => setDraft((current) => ({ ...current, googleMapsUrl: event.target.value }))}
                    placeholder="https://maps.google.com/..."
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="location_mode">Modo de entrega</FieldLabel>
                  <select
                    id="location_mode"
                    value={draft.deliveryMode}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        deliveryMode: event.target.value as DeliveryMode,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "#212125",
                      color: "#f5f5f7",
                    }}
                  >
                    <option value="BOTH">Entrega e retirada</option>
                    <option value="DELIVERY_ONLY">Somente entrega</option>
                    <option value="PICKUP_ONLY">Somente retirada</option>
                    <option value="NEGOTIATE">A combinar</option>
                  </select>
                </FieldGroup>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button type="submit" disabled={createLocation.isPending || updateLocation.isPending}>
                    {createLocation.isPending || updateLocation.isPending ? "Salvando..." : "Salvar local"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditing(false);
                      setDraft(emptyDraft);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <ProducerMuted>Selecione um local para editar ou crie um novo.</ProducerMuted>
            )}
          </ProducerCard>
        </ProducerGrid>
      </ProducerStack>
    </ProducerShell>
  );
}
