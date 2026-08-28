import { useEffect } from "react";
import { Instagram, Globe, FileText, Apple, PlayCircle } from "lucide-react";
import { styled } from "@/theme/stitches.config";
import { PageContent } from "@/components/layout/PageContent";
import { Card, Section, SectionTitle } from "@/components/ui/Card";
import { SITE } from "@/constants/site";

const Hero = styled("header", {
  textAlign: "center",
  padding: "$8 $4 $6",
});

const Title = styled("h1", {
  margin: 0,
  fontSize: "$2xl",
  color: "$text",
});

const Subtitle = styled("p", {
  margin: "$3 auto 0",
  maxWidth: 640,
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
  transition: "background-color 140ms ease, border-color 140ms ease",
  "&:hover": {
    backgroundColor: "$primarySoft",
    borderColor: "$primaryBorder",
  },
  "&:focus-visible": {
    outline: "none",
    borderColor: "$primaryBorder",
    boxShadow: "0 0 0 2px $colors$primaryBorder",
  },
  "&:active": {
    transform: "translateY(1px)",
  },
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

export function AboutPage() {
  useEffect(() => {
    document.title = `Sobre - ${SITE.brand}`;
  }, []);

  return (
    <PageContent>
      <Hero>
        <Title>Sobre o {SITE.brand}</Title>
        <Subtitle>{SITE.tagline}</Subtitle>
      </Hero>

      <Section>
        <Card>
          <SectionTitle>É produtor(a)?</SectionTitle>
          <p style={{ marginTop: 0, color: "#a1a1aa" }}>
            Cadastre seu negócio no app <strong>{SITE.mobileApp.name}</strong> e crie seu catálogo
            de produtos digital em minutos — ideal para bares, feirantes e pequenos negócios.
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
        <SectionTitle>Nossos canais</SectionTitle>
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
        </LinkGrid>
      </Section>
    </PageContent>
  );
}
