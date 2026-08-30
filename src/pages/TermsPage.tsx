import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { PageContent } from "@/components/layout/PageContent";
import { Card, Section } from "@/components/ui/Card";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { useContracts } from "@/hooks/useContracts";
import { SITE } from "@/constants/site";
import { styled } from "@/theme/stitches.config";

const Hero = styled("header", {
  padding: "$8 $4 $4",
  textAlign: "center",
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

const Body = styled("div", {
  display: "grid",
  gap: "$3",
  color: "$text",
  lineHeight: 1.65,

  h2: {
    margin: "$5 0 $2",
    fontSize: "$lg",
    color: "$text",
  },

  p: {
    margin: 0,
    color: "$textMuted",
  },
});

const DocTitle = styled("h2", {
  margin: "0 0 $3",
  fontSize: "$xl",
  color: "$text",
});

const LoadingWrap = styled("div", {
  display: "grid",
  placeItems: "center",
  padding: "$8 $4",
});

const ErrorText = styled("p", {
  color: "$danger",
  textAlign: "center",
});

const LegalNote = styled("p", {
  marginTop: "$5",
  color: "$textSubtle",
  fontSize: "$sm",

  a: {
    color: "$primary",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
});

const RELEVANT_TYPES = ["APP_TERMS", "ACCOUNT_TERMS"] as const;

export function TermsPage() {
  useEffect(() => {
    document.title = `Termos de Uso - ${SITE.brand}`;
  }, []);

  const contracts = useContracts();

  return (
    <PageContent>
      <Hero>
        <Title>Termos de Uso</Title>
        <Subtitle>
          Estes documentos descrevem as regras de uso do {SITE.brand} e do serviço de catálogo
          digital oferecido aos produtores.
        </Subtitle>
      </Hero>

      <Section>
        <Card>
          {contracts.status === "loading" ? (
            <LoadingWrap>
              <LogoSpinner label="Carregando termos..." />
            </LoadingWrap>
          ) : contracts.status === "error" ? (
            <ErrorText>{contracts.message}</ErrorText>
          ) : (
            <Body>
              {RELEVANT_TYPES.map((type) => {
                const doc = contracts.data.find((d) => d.type === type);
                if (!doc) return null;
                return (
                  <div key={doc.id}>
                    <DocTitle>{doc.title}</DocTitle>
                    {doc.content_md.split("\n\n").map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                );
              })}
            </Body>
          )}

          <LegalNote>
            Para saber como tratamos seus dados pessoais, veja nossa{" "}
            <a href="/privacy">Política de Privacidade</a>. Página pública para referência em lojas
            de aplicativos e parceiros. Link direto: /terms{" "}
            <ExternalLink size={14} style={{ verticalAlign: "text-bottom" }} />
          </LegalNote>
        </Card>
      </Section>
    </PageContent>
  );
}
