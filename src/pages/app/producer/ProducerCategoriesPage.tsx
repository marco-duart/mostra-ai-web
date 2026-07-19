import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProducerShell } from "@/components/producer/ProducerShell";
import {
  ProducerCard,
  ProducerMuted,
  ProducerPageHero,
  ProducerRow,
  ProducerSectionTitle,
  ProducerStack,
} from "@/components/producer/ProducerUI";
import {
  useCreateProducerCategoryMutation,
  useDeleteProducerCategoryMutation,
  useProducerCategoriesQuery,
  useReorderProducerCategoriesMutation,
} from "@/hooks/useProducerCategories";

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

export function ProducerCategoriesPage() {
  const categoriesQuery = useProducerCategoriesQuery();
  const createCategory = useCreateProducerCategoryMutation();
  const deleteCategory = useDeleteProducerCategoryMutation();
  const reorderCategories = useReorderProducerCategoriesMutation();

  const [name, setName] = useState("");

  const categories = useMemo(
    () => [...(categoriesQuery.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [categoriesQuery.data],
  );

  const onCreate = async () => {
    if (name.trim().length < 2) {
      toast.error("Nome da categoria muito curto.");
      return;
    }
    try {
      await createCategory.mutateAsync({ name: name.trim() });
      setName("");
      toast.success("Categoria criada.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Remover categoria?")) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast.success("Categoria removida.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const swap = async (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= categories.length) return;

    const cloned = [...categories];
    const current = cloned[index];
    cloned[index] = cloned[next];
    cloned[next] = current;

    try {
      await reorderCategories.mutateAsync({ ids: cloned.map((item) => item.id) });
      toast.success("Ordem atualizada.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  return (
    <ProducerShell>
      <ProducerStack>
        <ProducerCard>
          <ProducerPageHero
            stepLabel="Estrutura"
            title="Categorias"
            subtitle="Crie, apague e reordene categorias para manter o cardápio organizado."
          />
        </ProducerCard>

        <ProducerCard>
          <ProducerSectionTitle>Nova categoria</ProducerSectionTitle>
          <ProducerRow>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Lanches artesanais"
            />
            <Button onClick={onCreate} disabled={createCategory.isPending}>
              {createCategory.isPending ? "Criando..." : "Criar"}
            </Button>
          </ProducerRow>
        </ProducerCard>

        <ProducerCard>
          <ProducerSectionTitle>Lista e ordenação</ProducerSectionTitle>
          {categories.length === 0 ? (
            <ProducerMuted>Nenhuma categoria ainda.</ProducerMuted>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    padding: "10px 12px",
                    backgroundColor: "#212125",
                  }}
                >
                  <strong style={{ flex: 1 }}>{category.name}</strong>
                  <Button variant="ghost" size="sm" onClick={() => swap(index, -1)} disabled={index === 0}>
                    Subir
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => swap(index, 1)}
                    disabled={index === categories.length - 1}
                  >
                    Descer
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onDelete(category.id)}>
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ProducerCard>
      </ProducerStack>
    </ProducerShell>
  );
}
