import { Link } from "react-router-dom";
import { styled } from "@/theme/stitches.config";
import { Button } from "@/components/ui/Button";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { ProducerShell } from "@/components/producer/ProducerShell";
import {
  ProducerCard,
  ProducerGrid,
  ProducerMetric,
  ProducerMetricLabel,
  ProducerMetricValue,
  ProducerMuted,
  ProducerPageHero,
  ProducerSectionTitle,
  ProducerStack,
} from "@/components/producer/ProducerUI";
import { useProducerStoreQuery } from "@/hooks/useProducerStore";
import { useProducerProductsQuery } from "@/hooks/useProducerProducts";
import { useProducerCategoriesQuery } from "@/hooks/useProducerCategories";
import { useProducerLocationsQuery } from "@/hooks/useProducerLocations";

const QuickLink = styled(Link, {
  display: "inline-block",
});

function LoadingState() {
  return (
    <ProducerCard>
      <LogoSpinner label="Carregando painel..." />
    </ProducerCard>
  );
}

export function ProducerDashboardPage() {
  const store = useProducerStoreQuery();
  const products = useProducerProductsQuery();
  const categories = useProducerCategoriesQuery();
  const locations = useProducerLocationsQuery();

  const isLoading = store.isPending || products.isPending || categories.isPending || locations.isPending;

  return (
    <ProducerShell>
      <ProducerStack>
        <ProducerCard>
          <ProducerPageHero
            stepLabel="Visão geral"
            title="Painel do produtor"
            subtitle="Mesmo fluxo do app mobile, com leitura rápida para liberar sua operação no web."
          />
        </ProducerCard>

        {isLoading ? (
          <LoadingState />
        ) : (
          <ProducerGrid>
            <ProducerMetric>
              <ProducerMetricLabel>Loja</ProducerMetricLabel>
              <ProducerMetricValue>{store.data?.name ?? "-"}</ProducerMetricValue>
              <ProducerMuted>Status: {store.data?.isActive ? "Ativa" : "Desativada"}</ProducerMuted>
            </ProducerMetric>
            <ProducerMetric>
              <ProducerMetricLabel>Produtos</ProducerMetricLabel>
              <ProducerMetricValue>{products.data?.length ?? 0}</ProducerMetricValue>
              <ProducerMuted>
                Ativos: {(products.data ?? []).filter((item) => item.isAvailable).length}
              </ProducerMuted>
            </ProducerMetric>
            <ProducerMetric>
              <ProducerMetricLabel>Categorias</ProducerMetricLabel>
              <ProducerMetricValue>{categories.data?.length ?? 0}</ProducerMetricValue>
              <ProducerMuted>Organize por prioridade de venda</ProducerMuted>
            </ProducerMetric>
            <ProducerMetric>
              <ProducerMetricLabel>Locais</ProducerMetricLabel>
              <ProducerMetricValue>{locations.data?.length ?? 0}</ProducerMetricValue>
              <ProducerMuted>
                Ativo: {(locations.data ?? []).find((item) => item.isCurrentActive)?.name ?? "Nenhum"}
              </ProducerMuted>
            </ProducerMetric>
          </ProducerGrid>
        )}

        <ProducerCard>
          <ProducerSectionTitle>Ações rápidas</ProducerSectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <QuickLink to="/producer/products">
              <Button variant="primary">Gerenciar produtos</Button>
            </QuickLink>
            <QuickLink to="/producer/categories">
              <Button variant="secondary">Gerenciar categorias</Button>
            </QuickLink>
            <QuickLink to="/producer/locations">
              <Button variant="secondary">Gerenciar locais</Button>
            </QuickLink>
            <QuickLink to="/producer/store">
              <Button variant="secondary">Editar loja</Button>
            </QuickLink>
          </div>
        </ProducerCard>
      </ProducerStack>
    </ProducerShell>
  );
}
