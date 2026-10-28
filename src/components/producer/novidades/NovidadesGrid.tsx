import { styled } from "@/theme/stitches.config";
import type { Novidade } from "@/lib/novidades";
import { novidadesService, type ProducerWebPlacement } from "@/services/novidades.service";
import { NovidadeCard } from "./NovidadeCard";

const Grid = styled("div", {
  display: "grid",
  gap: "$4",
  gridTemplateColumns: "1fr",
  "@lg": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
});

type NovidadesGridProps = {
  placement: ProducerWebPlacement;
  items: Novidade[];
};

export function NovidadesGrid({ placement, items }: NovidadesGridProps) {
  return (
    <Grid>
      {items.map((novidade) => (
        <NovidadeCard
          key={novidade.id}
          novidade={novidade}
          onImpression={() => novidadesService.impression(novidade.id, placement)}
          onClick={() => novidadesService.click(novidade.id, placement)}
        />
      ))}
    </Grid>
  );
}
