import { styled } from "@/theme/stitches.config";
import { ProducerBrandLogo } from "@/components/producer/ProducerBrandLogo";

export const ProducerPage = styled("main", {
  minHeight: "100dvh",
  background:
    "radial-gradient(1200px 400px at 10% -10%, rgba(228,87,46,0.22), transparent), radial-gradient(900px 320px at 90% 0%, rgba(34,197,94,0.12), transparent), $bg",
  color: "$text",
});

export const ProducerContainer = styled("div", {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "$5 $4 $9",
});

export const ProducerCard = styled("section", {
  backgroundColor: "$surface",
  border: "1px solid $border",
  borderRadius: "$lg",
  padding: "$5",
  boxShadow: "$sm",
});

export const ProducerGrid = styled("div", {
  display: "grid",
  gap: "$4",
  gridTemplateColumns: "1fr",
  "@lg": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

export const ProducerTitle = styled("h1", {
  margin: 0,
  fontSize: "$2xl",
  lineHeight: 1.2,
});

export const ProducerSubtitle = styled("p", {
  margin: "$2 0 0",
  color: "$textMuted",
  fontSize: "$sm",
});

export const ProducerSectionTitle = styled("h2", {
  margin: 0,
  marginBottom: "$3",
  fontSize: "$lg",
});

export const ProducerStack = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$4",
});

export const ProducerField = styled("label", {
  display: "flex",
  flexDirection: "column",
  gap: "$2",
  fontSize: "$sm",
  color: "$textMuted",
});

export const ProducerLegend = styled("span", {
  fontSize: "$sm",
  color: "$textMuted",
});

export const ProducerRow = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$3",
  "@lg": {
    flexDirection: "row",
    alignItems: "center",
  },
});

export const ProducerMetric = styled("div", {
  border: "1px solid $border",
  borderRadius: "$md",
  padding: "$4",
  backgroundColor: "$surfaceAlt",
  display: "flex",
  flexDirection: "column",
  gap: "$1",
});

export const ProducerMetricValue = styled("strong", {
  fontSize: "$xl",
  lineHeight: 1,
});

export const ProducerMetricLabel = styled("span", {
  color: "$textMuted",
  fontSize: "$xs",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const ProducerMuted = styled("p", {
  margin: 0,
  color: "$textMuted",
  fontSize: "$sm",
});

export const ProducerPill = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "$pill",
  border: "1px solid $primaryBorder",
  padding: "$1 $3",
  fontSize: "$xs",
  color: "$primary",
  backgroundColor: "$primarySoft",
});

const HeroWrap = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: "$2",
});

const HeroStep = styled("span", {
  fontSize: "$xs",
  fontWeight: "$semibold",
  color: "$primary",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
});

type ProducerPageHeroProps = {
  title: string;
  subtitle: string;
  stepLabel?: string;
};

export function ProducerPageHero({ title, subtitle, stepLabel }: ProducerPageHeroProps) {
  return (
    <HeroWrap>
      <ProducerBrandLogo size={76} variant="circle" frame="none" />
      {stepLabel ? <HeroStep>{stepLabel}</HeroStep> : null}
      <ProducerTitle>{title}</ProducerTitle>
      <ProducerSubtitle>{subtitle}</ProducerSubtitle>
    </HeroWrap>
  );
}
