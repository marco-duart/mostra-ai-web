import { useEffect, useRef } from "react";
import { styled } from "@/theme/stitches.config";
import { ProducerPill } from "@/components/producer/ProducerUI";
import {
  novidadeBadge,
  novidadeCta,
  novidadeImage,
  novidadePrice,
  type Novidade,
} from "@/lib/novidades";
import { RestrictedMarkdown } from "./RestrictedMarkdown";

const Card = styled("article", {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "$surfaceAlt",
  border: "1px solid $border",
  borderRadius: "$md",
  overflow: "hidden",
});

const Image = styled("img", {
  width: "100%",
  aspectRatio: "3 / 1",
  objectFit: "cover",
  backgroundColor: "$surface",
});

const Body = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$2",
  padding: "$4",
  flex: 1,
});

const Title = styled("h3", { margin: 0, fontSize: "$lg", lineHeight: 1.25 });

const Muted = styled("p", { margin: 0, color: "$textMuted", fontSize: "$sm" });

const Price = styled("p", { margin: 0, fontWeight: "$semibold", fontSize: "$sm" });

const Markdown = styled("div", {
  color: "$textMuted",
  fontSize: "$sm",
  "& p": { margin: 0 },
  "& p + p": { marginTop: "$2" },
  "& a": { color: "$primary", textDecoration: "underline" },
});

const Cta = styled("a", {
  marginTop: "auto",
  alignSelf: "flex-start",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "$2 $5",
  borderRadius: "$md",
  fontWeight: "$semibold",
  fontSize: "$sm",
  backgroundColor: "$primary",
  color: "$primaryContrast",
  textDecoration: "none",
});

type NovidadeCardProps = {
  novidade: Novidade;
  /** Chamado uma vez quando o card fica pelo menos 50% visível. */
  onImpression: () => void;
  onClick: () => void;
};

export function NovidadeCard({ novidade, onImpression, onClick }: NovidadeCardProps) {
  const ref = useRef<HTMLElement>(null);
  const impression = useRef(onImpression);
  useEffect(() => {
    impression.current = onImpression;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          impression.current();
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [novidade.id]);

  const badge = novidadeBadge(novidade.kind);
  const image = novidadeImage(novidade);
  const price = novidadePrice(novidade);
  const cta = novidadeCta(novidade);

  return (
    <Card ref={ref}>
      {image ? <Image src={image.url} alt={image.alt} loading="lazy" /> : null}
      <Body>
        {badge ? (
          <span>
            <ProducerPill>{badge}</ProducerPill>
          </span>
        ) : null}
        <Title>{novidade.title}</Title>
        {novidade.subtitle ? <Muted>{novidade.subtitle}</Muted> : null}
        {price ? <Price>{price}</Price> : null}
        {novidade.bodyMd ? (
          <Markdown>
            <RestrictedMarkdown source={novidade.bodyMd} />
          </Markdown>
        ) : null}
        {cta ? (
          <Cta href={cta.url} target="_blank" rel="noopener noreferrer" onClick={onClick}>
            {cta.label}
          </Cta>
        ) : null}
      </Body>
    </Card>
  );
}
