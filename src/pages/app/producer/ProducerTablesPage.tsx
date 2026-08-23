import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
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
import { useProducerAuth } from "@/contexts/producerAuth";
import { useProducerLocationsQuery } from "@/hooks/useProducerLocations";
import { useProducerTeamQuery } from "@/hooks/useProducerTeam";
import {
  useAssignProducerTableMemberMutation,
  useAttendProducerQueueItemMutation,
  useCloseProducerTableMutation,
  useCreateProducerTableMutation,
  useDeleteProducerTableMutation,
  useOpenProducerTableMutation,
  useProducerQueueQuery,
  useProducerTablesQuery,
  useUnassignProducerTableMemberMutation,
} from "@/hooks/useProducerTables";
import type { ProducerTable } from "@/types/producer";

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

function formatCallTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const cardStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: 12,
  backgroundColor: "#212125",
  display: "grid",
  gap: 8,
} as const;

function QueueSection() {
  const queueQuery = useProducerQueueQuery();
  const attend = useAttendProducerQueueItemMutation();

  const onAttend = async (id: string) => {
    try {
      await attend.mutateAsync(id);
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const items = queueQuery.data ?? [];

  return (
    <ProducerCard>
      <ProducerSectionTitle>Fila de atendimento (chama garçom)</ProducerSectionTitle>
      {queueQuery.isPending ? (
        <ProducerMuted>Carregando...</ProducerMuted>
      ) : items.length === 0 ? (
        <ProducerMuted>Nenhum chamado pendente no momento.</ProducerMuted>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                ...cardStyle,
                gridTemplateColumns: "1fr auto",
                display: "grid",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{item.tableName}</strong>
                <ProducerMuted>Chamado às {formatCallTime(item.createdAt)}</ProducerMuted>
              </div>
              <Button size="sm" onClick={() => onAttend(item.id)} disabled={attend.isPending}>
                Marcar atendido
              </Button>
            </div>
          ))}
        </div>
      )}
    </ProducerCard>
  );
}

function TableDetail({ table }: { table: ProducerTable }) {
  const { store } = useProducerAuth();
  const teamQuery = useProducerTeamQuery();
  const assign = useAssignProducerTableMemberMutation();
  const unassign = useUnassignProducerTableMemberMutation();
  const openTable = useOpenProducerTableMutation();
  const closeTable = useCloseProducerTableMutation();

  const assignedIds = new Set(table.members.map((m) => m.storeMemberId));
  const tableLink =
    table.status === "OPEN" && table.currentToken && store?.slug
      ? `http://mostraai.app.br/${store.slug}/mesa/${table.currentToken}`
      : null;

  const toggleMember = async (storeMemberId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await unassign.mutateAsync({ tableId: table.id, storeMemberId });
      } else {
        await assign.mutateAsync({ tableId: table.id, storeMemberId });
      }
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onOpen = async () => {
    try {
      await openTable.mutateAsync(table.id);
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onClose = async () => {
    if (!window.confirm("Fechar mesa? O link/QR atual deixa de funcionar imediatamente.")) return;
    try {
      await closeTable.mutateAsync(table.id);
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  return (
    <ProducerCard>
      <ProducerSectionTitle>{table.name}</ProducerSectionTitle>
      <ProducerMuted>{table.locationName}</ProducerMuted>

      <div style={{ marginTop: 8 }}>
        {table.status === "OPEN" ? (
          <Button size="sm" variant="secondary" onClick={onClose} disabled={closeTable.isPending}>
            Fechar mesa
          </Button>
        ) : (
          <Button size="sm" onClick={onOpen} disabled={openTable.isPending}>
            Abrir mesa
          </Button>
        )}
      </div>

      {tableLink ? (
        <div
          style={{
            display: "grid",
            justifyItems: "center",
            gap: 10,
            padding: 16,
            marginTop: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            backgroundColor: "#18181b",
          }}
        >
          <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
            <QRCodeSVG value={tableLink} size={200} />
          </div>
          <ProducerMuted>
            O cliente escaneia esse QR (ou abre o link) para ver o cardápio e chamar você.
          </ProducerMuted>
          <ProducerMuted>{tableLink}</ProducerMuted>
        </div>
      ) : (
        <ProducerMuted>Abra a mesa para gerar um QR/link temporário para os clientes.</ProducerMuted>
      )}

      <ProducerSectionTitle style={{ marginTop: 16 }}>Parceiros responsáveis</ProducerSectionTitle>
      {teamQuery.isPending ? (
        <ProducerMuted>Carregando equipe...</ProducerMuted>
      ) : (teamQuery.data ?? []).length === 0 ? (
        <ProducerMuted>
          Você ainda não tem parceiros na equipe. Adicione um na aba Equipe primeiro.
        </ProducerMuted>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {(teamQuery.data ?? []).map((member) => {
            const isAssigned = assignedIds.has(member.id);
            return (
              <label
                key={member.id}
                style={{
                  ...cardStyle,
                  gridTemplateColumns: "1fr auto",
                  display: "grid",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div>
                  <strong>{member.user.name ?? member.user.email}</strong>
                  {member.role ? <ProducerMuted>{member.role}</ProducerMuted> : null}
                </div>
                <input
                  type="checkbox"
                  checked={isAssigned}
                  onChange={() => toggleMember(member.id, isAssigned)}
                />
              </label>
            );
          })}
        </div>
      )}
    </ProducerCard>
  );
}

export function ProducerTablesPage() {
  const tablesQuery = useProducerTablesQuery();
  const locationsQuery = useProducerLocationsQuery();
  const createTable = useCreateProducerTableMutation();
  const deleteTable = useDeleteProducerTableMutation();

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [locationId, setLocationId] = useState("");

  const tables = tablesQuery.data ?? [];
  const locations = locationsQuery.data ?? [];
  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  const effectiveLocationId = locationId || (locations.length === 1 ? locations[0].id : "");

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!effectiveLocationId) {
      toast.error("Escolha a localização da mesa.");
      return;
    }
    if (name.trim().length < 1) {
      toast.error("Dê um nome pra mesa.");
      return;
    }
    try {
      await createTable.mutateAsync({ locationId: effectiveLocationId, name: name.trim() });
      toast.success("Mesa criada.");
      setName("");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onDelete = async (table: ProducerTable) => {
    if (!window.confirm(`Remover ${table.name}?`)) return;
    try {
      await deleteTable.mutateAsync(table.id);
      toast.success("Mesa removida.");
      if (selectedTableId === table.id) setSelectedTableId(null);
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
            title="Mesas"
            subtitle="Cadastre mesas, gere o QR/link de cada uma e acompanhe os chamados de garçom."
          />
        </ProducerCard>

        <QueueSection />

        <ProducerGrid>
          <ProducerCard>
            <ProducerSectionTitle>Suas mesas</ProducerSectionTitle>
            {tablesQuery.isPending ? (
              <ProducerMuted>Carregando...</ProducerMuted>
            ) : tables.length === 0 ? (
              <ProducerMuted>Nenhuma mesa cadastrada.</ProducerMuted>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {tables.map((table) => (
                  <article key={table.id} style={cardStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong>{table.name}</strong>
                      <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                        {table.status === "OPEN" ? "Aberta" : "Fechada"}
                      </span>
                    </div>
                    <ProducerMuted>{table.locationName}</ProducerMuted>
                    <ProducerMuted>
                      {table.members.length > 0
                        ? table.members.map((m) => m.name ?? "Parceiro").join(", ")
                        : "Nenhum parceiro atribuído"}
                    </ProducerMuted>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedTableId(table.id)}>
                        Gerenciar
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onDelete(table)}>
                        Remover
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <ProducerSectionTitle>Nova mesa</ProducerSectionTitle>
              {locations.length === 0 ? (
                <ProducerMuted>
                  Cadastre uma localização (aba Locais) antes de criar mesas.
                </ProducerMuted>
              ) : (
                <form onSubmit={onCreate}>
                  {locations.length > 1 ? (
                    <FieldGroup>
                      <FieldLabel htmlFor="table_location">Localização</FieldLabel>
                      <select
                        id="table_location"
                        value={effectiveLocationId}
                        onChange={(event) => setLocationId(event.target.value)}
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
                  <FieldGroup>
                    <FieldLabel htmlFor="table_name">Nome da mesa</FieldLabel>
                    <Input
                      id="table_name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Ex.: Mesa 5, Balcão 2"
                    />
                  </FieldGroup>
                  <Button type="submit" disabled={createTable.isPending}>
                    {createTable.isPending ? "Criando..." : "Criar mesa"}
                  </Button>
                </form>
              )}
            </div>
          </ProducerCard>

          {selectedTable ? (
            <TableDetail table={selectedTable} />
          ) : (
            <ProducerCard>
              <ProducerSectionTitle>Gerenciar mesa</ProducerSectionTitle>
              <ProducerMuted>
                Selecione uma mesa na lista para abrir/fechar, ver o QR code e atribuir parceiros.
              </ProducerMuted>
            </ProducerCard>
          )}
        </ProducerGrid>
      </ProducerStack>
    </ProducerShell>
  );
}
