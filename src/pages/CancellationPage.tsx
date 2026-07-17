import { useEffect } from "react";
import { Mail } from "lucide-react";
import { PageContent } from "@/components/layout/PageContent";
import { Card, Section } from "@/components/ui/Card";
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
  gap: "$4",
  color: "$text",
  lineHeight: 1.65,

  "p": {
    margin: 0,
    color: "$textMuted",
  },

  "a": {
    color: "$primary",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
    display: "inline-flex",
    alignItems: "center",
    gap: "$2",
    fontWeight: 600,
  },
});

const EmailBlock = styled("div", {
  padding: "$4",
  borderRadius: "$md",
  border: "1px solid $border",
  backgroundColor: "$surface",
});

export function CancellationPage() {
  useEffect(() => {
    document.title = `Solicitação de Cancelamento - ${SITE.brand}`;
  }, []);

  return (
    <PageContent>
      <Hero>
        <Title>Solicitação de Cancelamento</Title>
        <Subtitle>
          Para solicitar o cancelamento da sua conta ou assinatura, entre em contato pelo e-mail
          abaixo.
        </Subtitle>
      </Hero>

      <Section>
        <Card>
          <Body>
            <p>
              Nosso time fará o atendimento da solicitação e retornará com os próximos passos.
            </p>

            <EmailBlock>
              <a href="mailto:marcoaurelioduartebezerra@gmail.com">
                <Mail size={16} />
                marcoaurelioduartebezerra@gmail.com
              </a>
            </EmailBlock>
          </Body>
        </Card>
      </Section>
    </PageContent>
  );
}