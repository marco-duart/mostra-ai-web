import { useEffect, useState, type ChangeEvent, type CSSProperties, type FormEvent } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Copy, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, FieldLabel, Input, Textarea } from "@/components/ui/Input";
import { ProducerShell } from "@/components/producer/ProducerShell";
import {
  ProducerCard,
  ProducerField,
  ProducerGrid,
  ProducerMuted,
  ProducerPageHero,
  ProducerPill,
  ProducerRow,
  ProducerSectionTitle,
  ProducerStack,
} from "@/components/producer/ProducerUI";
import {
  useDisableProducerStoreMutation,
  useProducerStoreQuery,
  useUpdateProducerStoreMutation,
  useUploadProducerStoreBackgroundMutation,
  useUploadProducerStoreLogoMutation,
} from "@/hooks/useProducerStore";
import { getStoreThemeVars } from "@/utils/format";

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
  name: string;
  whatsapp: string;
  instagram: string;
  themePrimaryColor: string;
  themeSecondaryColor: string;
};

export function ProducerStorePage() {
  const storeQuery = useProducerStoreQuery();
  const updateStore = useUpdateProducerStoreMutation();
  const uploadLogo = useUploadProducerStoreLogoMutation();
  const uploadBackground = useUploadProducerStoreBackgroundMutation();
  const disableStore = useDisableProducerStoreMutation();

  const [draft, setDraft] = useState<Draft>({
    name: "",
    whatsapp: "",
    instagram: "",
    themePrimaryColor: "#E4572E",
    themeSecondaryColor: "#1A1A1A",
  });

  useEffect(() => {
    if (!storeQuery.data) return;
    setDraft({
      name: storeQuery.data.name,
      whatsapp: storeQuery.data.whatsapp,
      instagram: storeQuery.data.instagram ?? "",
      themePrimaryColor: storeQuery.data.themePrimaryColor,
      themeSecondaryColor: storeQuery.data.themeSecondaryColor,
    });
  }, [storeQuery.data]);

  const onUploadLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadLogo.mutateAsync(file);
      toast.success("Logo atualizada.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    } finally {
      event.target.value = "";
    }
  };

  const onUploadBackground = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadBackground.mutateAsync(file);
      toast.success("Background atualizado.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    } finally {
      event.target.value = "";
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^#[0-9A-Fa-f]{6}$/.test(draft.themePrimaryColor) || !/^#[0-9A-Fa-f]{6}$/.test(draft.themeSecondaryColor)) {
      toast.error("Use cores no formato #RRGGBB.");
      return;
    }

    try {
      await updateStore.mutateAsync({
        name: draft.name.trim(),
        whatsapp: draft.whatsapp.trim(),
        instagram: draft.instagram.trim() ? draft.instagram.trim() : null,
        themePrimaryColor: draft.themePrimaryColor.toUpperCase(),
        themeSecondaryColor: draft.themeSecondaryColor.toUpperCase(),
      });
      toast.success("Loja atualizada.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onDisable = async () => {
    const reason = window.prompt("Motivo da desativação (opcional):");
    if (reason === null) return;
    try {
      await disableStore.mutateAsync(reason);
      await storeQuery.refetch();
      toast.success("Conta desativada.");
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const themeVars = getStoreThemeVars(draft.themePrimaryColor, draft.themeSecondaryColor);
  const publicStoreUrl = storeQuery.data?.slug ? `http://mostraai.app.br/${storeQuery.data.slug}` : "";
  const qrCodeImageUrl = publicStoreUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(publicStoreUrl)}`
    : "";

  const onCopyPublicLink = async () => {
    if (!publicStoreUrl) return;
    try {
      await navigator.clipboard.writeText(publicStoreUrl);
      toast.success("Link copiado.");
    } catch {
      window.prompt("Copie o link manualmente:", publicStoreUrl);
    }
  };

  const onSharePublicLink = async () => {
    if (!publicStoreUrl) return;
    const shareData = {
      title: draft.name || "MostraAi",
      text: `Veja o catálogo de ${draft.name || "nossa loja"}`,
      url: publicStoreUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Usuário cancelou o compartilhamento nativo.
      }
      return;
    }

    await onCopyPublicLink();
  };

  return (
    <ProducerShell>
      <ProducerStack>
        <ProducerCard>
          <ProducerPageHero
            stepLabel="Identidade"
            title="Sua loja"
            subtitle="Ajuste identidade, contato e visual com os mesmos campos usados no app mobile."
          />
        </ProducerCard>

        <ProducerCard>
          <ProducerSectionTitle>Visual e plano</ProducerSectionTitle>
          <ProducerGrid>
            <div>
              <ProducerMuted>Plano atual</ProducerMuted>
              <ProducerPill>
                {storeQuery.data?.subscription?.planType ?? "FREE"} · {storeQuery.data?.subscription?.status ?? "-"}
              </ProducerPill>
              {storeQuery.data?.subscription?.expiresAt ? (
                <ProducerMuted>
                  Válido até: {new Date(storeQuery.data.subscription.expiresAt).toLocaleDateString("pt-BR")}
                </ProducerMuted>
              ) : null}
            </div>
            <div>
              <ProducerMuted>
                A customização completa de background e cores pode depender do plano PREMIUM.
              </ProducerMuted>
            </div>
          </ProducerGrid>
        </ProducerCard>

        <ProducerCard>
          <ProducerSectionTitle>Link público e QR code</ProducerSectionTitle>
          <ProducerMuted>
            Compartilhe com seus clientes o mesmo link usado no app mobile.
          </ProducerMuted>

          {publicStoreUrl ? (
            <ProducerGrid style={{ marginTop: 16, alignItems: "center" }}>
              <div>
                <div
                  style={{
                    border: "1px solid var(--store-primary-border, rgba(228,87,46,0.35))",
                    background: "#fff",
                    borderRadius: 14,
                    width: "fit-content",
                    padding: 10,
                  }}
                >
                  <img
                    src={qrCodeImageUrl}
                    alt={`QR code para ${publicStoreUrl}`}
                    width={220}
                    height={220}
                    style={{ display: "block", borderRadius: 8 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <ProducerField>
                  URL da sua loja
                  <Input value={publicStoreUrl} readOnly />
                </ProducerField>

                <ProducerRow>
                  <Button variant="secondary" onClick={onCopyPublicLink}>
                    <Copy size={16} />
                    Copiar link
                  </Button>
                  <Button variant="secondary" onClick={onSharePublicLink}>
                    <Share2 size={16} />
                    Compartilhar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.open(publicStoreUrl, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink size={16} />
                    Abrir catálogo
                  </Button>
                </ProducerRow>
              </div>
            </ProducerGrid>
          ) : (
            <ProducerMuted style={{ marginTop: 8 }}>
              Salve os dados da loja para gerar o link público e o QR code.
            </ProducerMuted>
          )}
        </ProducerCard>

        <ProducerCard style={themeVars as CSSProperties}>
          <ProducerSectionTitle>Prévia visual</ProducerSectionTitle>
          <div
            style={{
              minHeight: 180,
              borderRadius: 14,
              border: "1px solid var(--store-primary-border)",
              background: "linear-gradient(145deg, var(--store-secondary-soft), #0f0f10)",
              padding: 16,
              display: "grid",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.14)",
                backgroundColor: "#0f0f10",
              }}
            >
              {storeQuery.data?.logoUrl ? (
                <img
                  src={storeQuery.data.logoUrl}
                  alt="Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
            </div>
            <strong style={{ fontSize: 22 }}>{draft.name || "Sua loja"}</strong>
            <span style={{ color: "var(--store-primary)" }}>Cor principal aplicada</span>
          </div>
          <ProducerRow style={{ marginTop: 12 }}>
            <ProducerField>
              Upload de logo
              <input type="file" accept="image/*" onChange={onUploadLogo} />
            </ProducerField>
            <ProducerField>
              Upload de background
              <input type="file" accept="image/*" onChange={onUploadBackground} />
            </ProducerField>
          </ProducerRow>
        </ProducerCard>

        <ProducerCard>
          <ProducerSectionTitle>Dados da loja</ProducerSectionTitle>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <FieldLabel htmlFor="store_name">Nome</FieldLabel>
              <Input
                id="store_name"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="store_whatsapp">WhatsApp</FieldLabel>
              <Input
                id="store_whatsapp"
                value={draft.whatsapp}
                onChange={(event) => setDraft((current) => ({ ...current, whatsapp: event.target.value }))}
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="store_instagram">Instagram</FieldLabel>
              <Input
                id="store_instagram"
                value={draft.instagram}
                onChange={(event) => setDraft((current) => ({ ...current, instagram: event.target.value }))}
                placeholder="@perfil"
              />
            </FieldGroup>
            <ProducerGrid>
              <FieldGroup>
                <FieldLabel htmlFor="store_primary_color">Cor primária</FieldLabel>
                <Input
                  id="store_primary_color"
                  value={draft.themePrimaryColor}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, themePrimaryColor: event.target.value }))
                  }
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="store_secondary_color">Cor secundária</FieldLabel>
                <Input
                  id="store_secondary_color"
                  value={draft.themeSecondaryColor}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, themeSecondaryColor: event.target.value }))
                  }
                />
              </FieldGroup>
            </ProducerGrid>
            <Button type="submit" block disabled={updateStore.isPending}>
              {updateStore.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </ProducerCard>

        <ProducerCard>
          <ProducerSectionTitle>Desativar conta</ProducerSectionTitle>
          <ProducerMuted>
            Ao desativar, seu catálogo fica indisponível para clientes até reativação manual.
          </ProducerMuted>
          <Textarea defaultValue="Desativado pelo produtor no painel web" readOnly />
          <Button variant="secondary" onClick={onDisable} disabled={disableStore.isPending}>
            {disableStore.isPending ? "Desativando..." : "Desativar loja"}
          </Button>
        </ProducerCard>
      </ProducerStack>
    </ProducerShell>
  );
}
