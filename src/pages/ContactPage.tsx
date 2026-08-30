import { useEffect } from "react";
import { Instagram, Mail, Globe } from "lucide-react";
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

const ChannelGrid = styled("div", {
  display: "grid",
  gap: "$3",
});

const ChannelRow = styled("a", {
  display: "flex",
  alignItems: "center",
  gap: "$3",
  padding: "$4",
  borderRadius: "$md",
  border: "1px solid $border",
  backgroundColor: "$surface",
  color: "$text",
  fontSize: "$md",
  fontWeight: "$medium",
  transition: "background-color 140ms ease, border-color 140ms ease",
  "&:hover": {
    backgroundColor: "$primarySoft",
    borderColor: "$primaryBorder",
  },
});

const IconWrap = styled("span", {
  display: "grid",
  placeItems: "center",
  width: 40,
  height: 40,
  borderRadius: "$pill",
  backgroundColor: "$surfaceAlt",
  color: "$primary",
  flexShrink: 0,
});

export function ContactPage() {
  useEffect(() => {
    document.title = `Contato - ${SITE.brand}`;
  }, []);

  return (
    <PageContent>
      <Hero>
        <Title>Fale conosco</Title>
        <Subtitle>
          Dúvidas, sugestões ou suporte com o {SITE.brand}? Use um dos canais abaixo.
        </Subtitle>
      </Hero>

      <Section>
        <Card>
          <ChannelGrid>
            <ChannelRow href="mailto:maaxis.tech@gmail.com">
              <IconWrap>
                <Mail size={20} />
              </IconWrap>
              maaxis.tech@gmail.com
            </ChannelRow>
            <ChannelRow href={SITE.personalInstagram} target="_blank" rel="noreferrer">
              <IconWrap>
                <Instagram size={20} />
              </IconWrap>
              Instagram oficial
            </ChannelRow>
            <ChannelRow href={SITE.personalSite} target="_blank" rel="noreferrer">
              <IconWrap>
                <Globe size={20} />
              </IconWrap>
              Site pessoal
            </ChannelRow>
          </ChannelGrid>
        </Card>
      </Section>
    </PageContent>
  );
}
