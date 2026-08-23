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
} from "@/hooks/useProducerTeam";

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

export function ProducerTeamPage() {
  const teamQuery = useProducerTeamQuery();
  const linkMember = useLinkProducerStoreMemberMutation();
  const removeMember = useRemoveProducerStoreMemberMutation();

  const [document, setDocument] = useState("");
  const [role, setRole] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanDocument = document.replace(/[^0-9A-Za-z]/g, "");
    if (cleanDocument.length < 11) {
      toast.error("Digite um CPF ou CNPJ válido.");
      return;
    }

    try {
      await linkMember.mutateAsync({
        document: cleanDocument,
        ...(role.trim() ? { role: role.trim() } : {}),
      });
      toast.success("Parceiro adicionado à equipe.");
      setDocument("");
      setRole("");
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
