import { useState, type FormEvent } from "react";
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
  useLinkProducerStoreMemberMutation,
  useProducerTeamQuery,
  useRemoveProducerStoreMemberMutation,
  useUpdateProducerServiceFeeMutation,
} from "@/hooks/useProducerTeam";
import type { StoreMember } from "@/types/producer";
import { formatServiceFee, parseServiceFee } from "@/utils/serviceFee";

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

function ServiceFeeEditor({ member }: { member: StoreMember }) {
  const update = useUpdateProducerServiceFeeMutation();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const isSet = member.serviceFeePercent !== null;

  const save = async () => {
    const fee = parseServiceFee(value);
    if (fee.error !== null) {
      toast.error(fee.error);
      return;
    }
    try {
      await update.mutateAsync({ id: member.id, serviceFeePercent: fee.value });
      toast.success("Taxa de serviço atualizada.");
      setEditing(false);
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  if (!editing) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <ProducerMuted style={isSet ? undefined : { color: "#EF3E41", fontWeight: 600 }}>
          {isSet
            ? `Taxa de serviço: ${formatServiceFee(member.serviceFeePercent ?? 0)}`
            : "Taxa de serviço não definida: esse garçom ainda não consegue abrir comanda."}
        </ProducerMuted>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setValue(isSet ? String(member.serviceFeePercent).replace(".", ",") : "");
            setEditing(true);
          }}
        >
          {isSet ? "Alterar taxa" : "Definir taxa"}
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <Input
        aria-label="Taxa de serviço (%)"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ex.: 10"
        style={{ maxWidth: 120 }}
        autoFocus
      />
      <Button size="sm" onClick={save} disabled={update.isPending}>
        {update.isPending ? "Salvando..." : "Salvar"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
        Cancelar
      </Button>
    </div>
  );
}

export function ProducerTeamPage() {
  const teamQuery = useProducerTeamQuery();
  const linkMember = useLinkProducerStoreMemberMutation();
  const removeMember = useRemoveProducerStoreMemberMutation();

  const [document, setDocument] = useState("");
  const [role, setRole] = useState("");
  const [serviceFee, setServiceFee] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanDocument = document.replace(/[^0-9A-Za-z]/g, "");
    if (cleanDocument.length < 11) {
      toast.error("Digite um CPF ou CNPJ válido.");
      return;
    }

    const fee = parseServiceFee(serviceFee);
    if (fee.error !== null) {
      toast.error(fee.error);
      return;
    }

    try {
      await linkMember.mutateAsync({
        document: cleanDocument,
        ...(role.trim() ? { role: role.trim() } : {}),
        serviceFeePercent: fee.value,
      });
      toast.success("Parceiro adicionado à equipe.");
      setDocument("");
      setRole("");
      setServiceFee("");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onRemove = async (id: string, label: string) => {
    if (!window.confirm(`Remover ${label} da equipe?`)) return;
    try {
      await removeMember.mutateAsync(id);
      toast.success("Parceiro removido.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const members = teamQuery.data ?? [];

  return (
    <ProducerShell>
      <ProducerStack>
        <ProducerCard>
          <ProducerPageHero
            stepLabel="Operação"
            title="Equipe"
            subtitle="Vincule parceiros (garçom, cozinha etc.) pelo CPF/CNPJ e diga quais mesas cada um atende."
          />
        </ProducerCard>

        <ProducerGrid>
          <ProducerCard>
            <ProducerSectionTitle>Sua equipe</ProducerSectionTitle>
            {teamQuery.isPending ? (
              <ProducerMuted>Carregando...</ProducerMuted>
            ) : members.length === 0 ? (
              <ProducerMuted>Nenhum parceiro vinculado ainda.</ProducerMuted>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {members.map((member) => (
                  <article
                    key={member.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: 12,
                      backgroundColor: "#212125",
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <strong>{member.user.name ?? member.user.email}</strong>
                    <ProducerMuted>{member.user.email}</ProducerMuted>
                    {member.role ? <ProducerMuted>Função: {member.role}</ProducerMuted> : null}
                    <ServiceFeeEditor member={member} />
                    <div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onRemove(member.id, member.user.name ?? member.user.email)}
                      >
                        Remover
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </ProducerCard>

          <ProducerCard>
            <ProducerSectionTitle>Adicionar parceiro</ProducerSectionTitle>
            <ProducerMuted>
              A pessoa precisa já ter uma conta em algum app MostraAi (ex.: app Cliente). Convite
              por e-mail para quem ainda não tem conta fica para uma versão futura.
            </ProducerMuted>
            <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
              <FieldGroup>
                <FieldLabel htmlFor="team_document">CPF ou CNPJ</FieldLabel>
                <Input
                  id="team_document"
                  value={document}
                  onChange={(event) => setDocument(event.target.value)}
                  placeholder="Somente números"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="team_role">Função (opcional)</FieldLabel>
                <Input
                  id="team_role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="Ex.: Garçom, Cozinha"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="team_fee">Taxa de serviço (%)</FieldLabel>
                <Input
                  id="team_fee"
                  value={serviceFee}
                  onChange={(event) => setServiceFee(event.target.value)}
                  placeholder="Ex.: 10 (use 0 se não houver taxa)"
                />
                <ProducerMuted>
                  Percentual que esse garçom recebe sobre as contas que abrir. Obrigatório, sem
                  valor padrão.
                </ProducerMuted>
              </FieldGroup>
              <Button type="submit" disabled={linkMember.isPending}>
                {linkMember.isPending ? "Adicionando..." : "Adicionar à equipe"}
              </Button>
            </form>
          </ProducerCard>
        </ProducerGrid>
      </ProducerStack>
    </ProducerShell>
  );
}
