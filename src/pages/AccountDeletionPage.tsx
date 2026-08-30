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

  ul: {
    margin: "$2 0 0",
    paddingLeft: "$5",
    color: "$textMuted",
  },

  li: {
    marginBottom: "$2",
  },
});

const EmailBlock = styled("a", {
  display: "inline-flex",
  alignItems: "center",
  gap: "$2",
  marginTop: "$2",
  padding: "$4",
  borderRadius: "$md",
  border: "1px solid $border",
  backgroundColor: "$surface",
  color: "$primary",
  fontWeight: 600,
  textDecoration: "none",
});

const LegalNote = styled("p", {
  marginTop: "$5",
  color: "$textSubtle",
  fontSize: "$sm",
});

export function AccountDeletionPage() {
  useEffect(() => {
    document.title = `Exclusão de Conta e Dados - ${SITE.brand}`;
  }, []);

  return (
    <PageContent>
      <Hero>
        <Title>Exclusão de Conta e Dados</Title>
        <Subtitle>
          Você pode solicitar a exclusão da sua conta {SITE.brand} e dos dados pessoais associados a
          qualquer momento.
        </Subtitle>
      </Hero>

      <Section>
        <Card>
          <Body>
            <h2>Como solicitar</h2>
            <p>
              Envie um e-mail para o endereço abaixo, a partir do mesmo e-mail cadastrado na conta,
              pedindo a exclusão. Não é preciso reinstalar nenhum app para isso.
            </p>
            <EmailBlock href="mailto:maaxis.tech@gmail.com">
              <Mail size={16} />
              maaxis.tech@gmail.com
            </EmailBlock>

            <h2>O que é excluído</h2>
            <ul>
              <li>Dados cadastrais da conta (nome, e-mail, CPF/CNPJ, telefone).</li>
              <li>
                Loja, produtos, categorias, imagens e demais dados do catálogo, caso você seja
                produtor(a).
              </li>
              <li>Favoritos, agendamentos e mensagens vinculados à conta.</li>
              <li>Tokens de notificação push registrados pelos apps MostraAí.</li>
            </ul>

            <h2>O que pode ser retido, e por quê</h2>
            <p>
              Alguns registros podem ser mantidos por período limitado mesmo após a exclusão, quando
              exigido por lei ou para fins de comprovação legal:
            </p>
            <ul>
              <li>
                Registros fiscais e contábeis de transações, quando aplicável, pelo prazo exigido
                pela legislação brasileira.
              </li>
              <li>
                Registros de aceite de termos de uso e política de privacidade, como comprovação de
                consentimento.
              </li>
            </ul>
            <p>Esses registros não incluem seus dados de perfil ou catálogo, que são removidos.</p>

            <h2>Prazo</h2>
            <p>
              Processamos pedidos de exclusão em até 15 dias úteis e confirmamos por e-mail assim
              que concluído.
            </p>
          </Body>

          <LegalNote>
            Página pública para referência na Google Play e demais lojas de aplicativos. Link
            direto: /account-deletion
          </LegalNote>
        </Card>
      </Section>
    </PageContent>
  );
}
