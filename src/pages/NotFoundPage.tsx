import { Smartphone, Instagram, Globe, FileText, Apple, PlayCircle } from "lucide-react";
import { styled } from "@/theme/stitches.config";
import { PageContent } from "@/components/layout/PageContent";
import { Card, Section, SectionTitle } from "@/components/ui/Card";
import { SITE } from "@/constants/site";

const Hero = styled("div", {
  textAlign: "center",
  padding: "$8 $4 $6",
});

const Big = styled("h1", {
  margin: 0,
  fontSize: "$3xl",
  fontWeight: "$bold",
  color: "$primary",
});

const Sub = styled("p", {
  margin: "$3 0 0",
  color: "$textMuted",
  fontSize: "$md",
});

const LinkGrid = styled("div", {
  display: "grid",
  gap: "$3",
});

const LinkRow = styled("a", {
  display: "flex",
  alignItems: "center",
  gap: "$3",
  padding: "$4",
  borderRadius: "$md",
  backgroundColor: "$surfaceAlt",
  border: "1px solid $border",
  color: "$text",
  fontSize: "$md",
  fontWeight: "$medium",
  "&:hover": { borderColor: "$primary" },
});

const IconWrap = styled("span", {
  display: "grid",
  placeItems: "center",
  width: 40,
  height: 40,
  borderRadius: "$pill",
  backgroundColor: "$surface",
  color: "$primary",
  flexShrink: 0,
});

const AppStores = styled("div", {
  display: "grid",
  gap: "$3",
  gridTemplateColumns: "1fr",
  "@sm": { gridTemplateColumns: "1fr 1fr" },
});

export function NotFoundPage() {
  return (
    <PageContent>
      <Hero>
        <Big>404</Big>
        <Sub>Não encontramos essa loja. Mas você chegou até o {SITE.brand}!</Sub>
      </Hero>

      <Section>
        <Card>
          <SectionTitle>É produtor(a)?</SectionTitle>
          <p style={{ marginTop: 0, color: "#a1a1aa" }}>
            Cadastre seu negócio no app <strong>{SITE.mobileApp.name}</strong> e crie
            seu cardápio digital em minutos — ideal para bares, feirantes e pequenos
            negócios.
          </p>
          <AppStores>
            <LinkRow href={SITE.mobileApp.androidUrl} target="_blank" rel="noreferrer">
              <IconWrap>
                <PlayCircle size={20} />
              </IconWrap>
              Baixar para Android
            </LinkRow>
            <LinkRow href={SITE.mobileApp.iosUrl} target="_blank" rel="noreferrer">
              <IconWrap>
                <Apple size={20} />
              </IconWrap>
              Baixar para iOS
            </LinkRow>
          </AppStores>
        </Card>
      </Section>

      <Section>
        <SectionTitle>Sobre nós</SectionTitle>
        <LinkGrid>
          <LinkRow href={SITE.personalInstagram} target="_blank" rel="noreferrer">
            <IconWrap>
              <Instagram size={20} />
            </IconWrap>
            Instagram oficial
          </LinkRow>
          <LinkRow href={SITE.personalSite} target="_blank" rel="noreferrer">
            <IconWrap>
              <Globe size={20} />
            </IconWrap>
            Site pessoal
          </LinkRow>
          <LinkRow href={SITE.cnpjLookupUrl} target="_blank" rel="noreferrer">
            <IconWrap>
              <FileText size={20} />
            </IconWrap>
            {SITE.cnpjLabel}
          </LinkRow>
          <LinkRow href="/" as="a">
            <IconWrap>
              <Smartphone size={20} />
            </IconWrap>
            Voltar para o início
          </LinkRow>
        </LinkGrid>
      </Section>
    </PageContent>
  );
}