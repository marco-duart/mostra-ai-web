import { ProducerShell } from "@/components/producer/ProducerShell";
import {
  ProducerCard,
  ProducerMuted,
  ProducerPageHero,
  ProducerStack,
} from "@/components/producer/ProducerUI";
import { NovidadesGrid } from "@/components/producer/novidades/NovidadesGrid";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { useNovidadesQuery } from "@/hooks/useNovidades";

export function ProducerNovidadesPage() {
  const novidades = useNovidadesQuery("producer.web.novidades");

  return (
    <ProducerShell>
      <ProducerStack>
        <ProducerCard>
          <ProducerPageHero
            stepLabel="Novidades"
            title="Novidades da Maaxis"
            subtitle="Produtos e serviços que podem ajudar a sua loja."
          />
        </ProducerCard>

        <ProducerCard>
          {novidades.isPending ? (
            <LogoSpinner label="Carregando novidades..." />
          ) : novidades.data && novidades.data.length > 0 ? (
            <NovidadesGrid placement="producer.web.novidades" items={novidades.data} />
          ) : (
            <ProducerMuted>Nenhuma novidade por enquanto.</ProducerMuted>
          )}
        </ProducerCard>
      </ProducerStack>
    </ProducerShell>
  );
}
