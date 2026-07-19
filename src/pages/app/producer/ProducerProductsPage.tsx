import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { FieldGroup, FieldLabel, Input, Textarea } from "@/components/ui/Input";
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
  useCreateProducerProductMutation,
  useDeleteProducerProductMutation,
  useProducerProductsQuery,
  useUpdateProducerProductMutation,
  useUploadProducerProductImageMutation,
} from "@/hooks/useProducerProducts";
import { useProducerCategoriesQuery } from "@/hooks/useProducerCategories";
import { formatPrice } from "@/utils/format";
import type { ProducerProduct } from "@/types/producer";

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
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string | null;
  isAvailable: boolean;
};

const emptyDraft: Draft = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  imageUrl: null,
  isAvailable: true,
};

function draftFromProduct(product: ProducerProduct): Draft {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: String(product.price),
    categoryId: product.categoryId ?? "",
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
  };
}

export function ProducerProductsPage() {
  const productsQuery = useProducerProductsQuery();
  const categoriesQuery = useProducerCategoriesQuery();
  const createProduct = useCreateProducerProductMutation();
  const updateProduct = useUpdateProducerProductMutation();
  const deleteProduct = useDeleteProducerProductMutation();
  const uploadImage = useUploadProducerProductImageMutation();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    (categoriesQuery.data ?? []).forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categoriesQuery.data]);

  const sortedProducts = useMemo(
    () => [...(productsQuery.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [productsQuery.data],
  );

  const onNew = () => {
    setDraft(emptyDraft);
    setEditing(true);
  };

  const onEdit = (product: ProducerProduct) => {
    setDraft(draftFromProduct(product));
    setEditing(true);
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadImage.mutateAsync(file);
      setDraft((current) => ({ ...current, imageUrl }));
      toast.success("Imagem enviada.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    } finally {
      event.target.value = "";
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const price = Number(draft.price.replace(",", "."));
    if (draft.name.trim().length < 2 || Number.isNaN(price) || price <= 0) {
      toast.error("Preencha nome e preço válidos.");
      return;
    }

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() ? draft.description.trim() : null,
      price,
      categoryId: draft.categoryId || null,
      imageUrl: draft.imageUrl,
      isAvailable: draft.isAvailable,
    };

    try {
      if (draft.id) {
        await updateProduct.mutateAsync({ id: draft.id, dto: payload });
        toast.success("Produto atualizado.");
      } else {
        await createProduct.mutateAsync(payload);
        toast.success("Produto criado.");
      }
      setEditing(false);
      setDraft(emptyDraft);
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Excluir este produto?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Produto removido.");
      if (draft.id === id) {
        setEditing(false);
        setDraft(emptyDraft);
      }
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onToggleAvailability = async (product: ProducerProduct) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        dto: { isAvailable: !product.isAvailable },
      });
      toast.success(product.isAvailable ? "Produto pausado." : "Produto ativado.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  return (
    <ProducerShell>
      <ProducerStack>
        <ProducerCard>
          <ProducerPageHero
            stepLabel="Catálogo"
            title="Produtos"
            subtitle="Cadastre, edite, pause e remova itens com o mesmo comportamento do mobile."
          />
        </ProducerCard>

        <ProducerGrid>
          <ProducerCard>
            <ProducerSectionTitle>Catálogo atual</ProducerSectionTitle>
            <Button variant="secondary" size="sm" onClick={onNew}>
              Novo produto
            </Button>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {sortedProducts.length === 0 ? (
                <ProducerMuted>Nenhum produto cadastrado.</ProducerMuted>
              ) : (
                sortedProducts.map((product) => (
                  <article
                    key={product.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: 12,
                      backgroundColor: "#212125",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <strong>{product.name}</strong>
                      <span>{formatPrice(product.price)}</span>
                    </div>
                    <ProducerMuted>
                      Categoria: {product.categoryId ? categoryMap.get(product.categoryId) ?? "(sem nome)" : "Sem categoria"}
                    </ProducerMuted>
                    <ProducerMuted>Status: {product.isAvailable ? "Disponível" : "Pausado"}</ProducerMuted>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button size="sm" variant="ghost" onClick={() => onEdit(product)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onToggleAvailability(product)}
                      >
                        {product.isAvailable ? "Pausar" : "Ativar"}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onDelete(product.id)}>
                        Remover
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </ProducerCard>

          <ProducerCard>
            <ProducerSectionTitle>{draft.id ? "Editar produto" : "Novo produto"}</ProducerSectionTitle>
            {editing ? (
              <form onSubmit={onSubmit}>
                <FieldGroup>
                  <FieldLabel htmlFor="product_name">Nome</FieldLabel>
                  <Input
                    id="product_name"
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="product_price">Preço (ex.: 12.90)</FieldLabel>
                  <Input
                    id="product_price"
                    value={draft.price}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, price: event.target.value }))
                    }
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="product_description">Descrição</FieldLabel>
                  <Textarea
                    id="product_description"
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="product_category">Categoria</FieldLabel>
                  <select
                    id="product_category"
                    value={draft.categoryId}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, categoryId: event.target.value }))
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
                    <option value="">Sem categoria</option>
                    {(categoriesQuery.data ?? []).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="product_image">Imagem</FieldLabel>
                  <input id="product_image" type="file" accept="image/*" onChange={onFileChange} />
                </FieldGroup>
                {draft.imageUrl ? (
                  <img
                    src={draft.imageUrl}
                    alt="Prévia do produto"
                    style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 12 }}
                  />
                ) : null}

                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <input
                    type="checkbox"
                    checked={draft.isAvailable}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, isAvailable: event.target.checked }))
                    }
                  />
                  Produto disponível no catálogo
                </label>

                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                    {createProduct.isPending || updateProduct.isPending ? "Salvando..." : "Salvar produto"}
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
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
              <ProducerMuted>Selecione um produto para editar ou crie um novo.</ProducerMuted>
            )}
          </ProducerCard>
        </ProducerGrid>
      </ProducerStack>
    </ProducerShell>
  );
}
