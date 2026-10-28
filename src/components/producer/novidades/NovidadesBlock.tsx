import { Link } from "react-router-dom";
import { styled } from "@/theme/stitches.config";
import { ProducerCard, ProducerSectionTitle } from "@/components/producer/ProducerUI";
import { useNovidadesQuery } from "@/hooks/useNovidades";
import { NovidadesGrid } from "./NovidadesGrid";

const Head = styled("div", {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "$3",
  "& a": { color: "$primary", fontSize: "$sm" },
});

/** Bloco do resumo: sem novidade (ou com erro) não renderiza nada. */
export function NovidadesBlock() {
  const { data } = useNovidadesQuery("producer.web");
  if (!data || data.length === 0) return null;

  return (
    <ProducerCard>
      <Head>
        <ProducerSectionTitle>Novidades</ProducerSectionTitle>
        <Link to="/producer/novidades">Ver todas</Link>
      </Head>
      <NovidadesGrid placement="producer.web" items={data} />
    </ProducerCard>
  );
}
