import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { styled } from "@/theme/stitches.config";
import { PageContent } from "@/components/layout/PageContent";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { StoreCatalogView } from "@/components/store/StoreCatalogView";
import { CallWaiterButton } from "@/components/store/CallWaiterButton";
import { useTableInfo } from "@/hooks/useTableInfo";

const CenterState = styled("div", {
  display: "grid",
  placeItems: "center",
  minHeight: "60dvh",
  padding: "$5",
  textAlign: "center",
  color: "$textMuted",
});

const Title = styled("h1", {
  margin: 0,
  marginBottom: "$2",
  fontSize: "$xl",
  fontWeight: "$bold",
  color: "$text",
});

/**
 * Página aberta a partir do QR/link temporário de uma mesa (gerado pelo
 * parceiro/garçom ao abrir a mesa no app). Renderiza o mesmo catálogo da
 * loja, mas com um botão fixo de "Chamar garçom" - e some completamente se
 * o token for inválido ou a mesa já tiver sido fechada, já que o servidor
 * apaga o token nesse momento (link salvo no celular do cliente para de
 * funcionar na hora).
 */
export function TablePage() {
  const { token } = useParams<{ slug: string; token: string }>();
  const state = useTableInfo(token);

  useEffect(() => {
    if (state.status === "success") {
      document.title = `Mesa ${state.data.table_name} · ${state.data.store_name} — MostraAi`;
    }
  }, [state]);

  if (state.status === "loading") {
    return (
      <CenterState>
        <LogoSpinner label="Carregando mesa..." />
      </CenterState>
    );
  }

  if (state.status === "not_found") {
    return (
      <PageContent>
        <CenterState>
          <div>
            <Title>Mesa indisponível</Title>
            <p>
              Esse link de mesa não é mais válido - ela pode já ter sido fechada. Peça pro
              garçom abrir a mesa novamente e escaneie o QR atualizado.
            </p>
          </div>
        </CenterState>
      </PageContent>
    );
  }

  if (state.status === "error") {
    return (
      <CenterState>
        <div>
          <p>Não foi possível carregar esta mesa.</p>
          <small>{state.message}</small>
        </div>
      </CenterState>
    );
  }

  return (
    <StoreCatalogView
      slug={state.data.store_slug}
      footer={<CallWaiterButton token={token!} tableName={state.data.table_name} />}
    />
  );
}
