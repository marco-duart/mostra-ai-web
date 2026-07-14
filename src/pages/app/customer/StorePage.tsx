import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { styled } from "@/theme/stitches.config";
import { PageContent } from "@/components/layout/PageContent";
import { Section, SectionTitle, Card } from "@/components/ui/Card";
import { StoreHeader } from "@/components/store/StoreHeader";
import { LocationsList } from "@/components/store/LocationsList";
import { MenuList } from "@/components/store/MenuList";
import { ContactForm } from "@/components/store/ContactForm";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { useStoreCatalog } from "@/hooks/useStoreCatalog";
import { getStoreThemeVars } from "@/utils/format";
import { NotFoundPage } from "@/pages/NotFoundPage";

const CenterState = styled("div", {
  display: "grid",
  placeItems: "center",
  minHeight: "60dvh",
  padding: "$5",
  textAlign: "center",
  color: "$textMuted",
});

const Banner = styled("div", {
  margin: "$4",
  padding: "$4",
  borderRadius: "$md",
  backgroundColor: "rgba(245,158,11,0.12)",
  border: "1px solid rgba(245,158,11,0.35)",
  color: "$warning",
  fontSize: "$sm",
  textAlign: "center",
});

export function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const state = useStoreCatalog(slug);

  const themeVars = useMemo(() => {
    if (state.status !== "success") return null;
    return getStoreThemeVars(
      state.data.store.theme_primary_color,
      state.data.store.theme_secondary_color,
    ) as React.CSSProperties;
  }, [state]);

  useEffect(() => {
    if (state.status === "success") {
      document.title = `${state.data.store.name} — MostraAi`;
    }
  }, [state]);

  if (state.status === "loading") {
    return (
      <CenterState>
        <LogoSpinner label="Carregando cardapio..." />
      </CenterState>
    );
  }
  if (state.status === "not_found") {
    return <NotFoundPage />;
  }
  if (state.status === "error") {
    return (
      <CenterState>
        <div>
          <p>Não foi possível carregar esta loja.</p>
          <small>{state.message}</small>
        </div>
      </CenterState>
    );
  }

  const { store, current_location, locations, menu, message } = state.data;

  return (
    <div style={themeVars ?? undefined}>
      <PageContent>
        <StoreHeader store={store} isOpen={current_location?.is_open_now} />

        {message && <Banner>{message}</Banner>}

        {menu.length > 0 && (
          <Section>
            <SectionTitle>Cardápio</SectionTitle>
            <MenuList menu={menu} />
          </Section>
        )}

        {(current_location || locations.length > 0) && (
          <Section>
            <SectionTitle>Onde encontrar</SectionTitle>
            <LocationsList
              locations={locations.length ? locations : current_location ? [current_location] : []}
            />
          </Section>
        )}

        <Section>
          <SectionTitle>Fale com {store.name}</SectionTitle>
          <Card>
            <ContactForm slug={slug!} />
          </Card>
        </Section>
      </PageContent>
    </div>
  );
}