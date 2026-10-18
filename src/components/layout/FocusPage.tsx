import { useEffect, type PropsWithChildren } from "react";
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
  maxWidth: 520,
  color: "$textMuted",
  fontSize: "$md",
});

type FocusPageProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

/** Página curta e centrada de uma única tarefa (recuperar senha, confirmar e-mail...). */
export function FocusPage({ title, subtitle, children }: FocusPageProps) {
  useEffect(() => {
    document.title = `${title} - ${SITE.brand}`;
  }, [title]);

  return (
    <PageContent>
      <Hero>
        <Title>{title}</Title>
        {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      </Hero>
      <Section>
        <Card>{children}</Card>
      </Section>
    </PageContent>
  );
}
