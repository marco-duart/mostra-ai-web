import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
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

const UpdatedAt = styled("p", {
  margin: "$2 0 0",
  color: "$textSubtle",
  fontSize: "$sm",
});

const Body = styled("div", {
  display: "grid",
  gap: "$4",
  color: "$text",
  lineHeight: 1.65,

  "h2": {
    margin: "$5 0 $2",
    fontSize: "$lg",
    color: "$text",
  },

  "p": {
    margin: 0,
    color: "$textMuted",
  },

  "ul": {
    margin: "$2 0 0",
    paddingLeft: "$5",
    color: "$textMuted",
  },

  "li": {
    marginBottom: "$2",
  },

  "a": {
    color: "$primary",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
});

const LegalNote = styled("p", {
  marginTop: "$5",
  color: "$textSubtle",
  fontSize: "$sm",
});

export function PrivacyPage() {
  useEffect(() => {
    document.title = `Política de Privacidade - ${SITE.brand}`;
  }, []);

  return (
    <PageContent>
      <Hero>
        <Title>Política de Privacidade e LGPD</Title>
        <Subtitle>
          Este documento descreve como o MostraAi coleta, usa, compartilha e protege dados
          pessoais no aplicativo e nos serviços relacionados.
        </Subtitle>
        <UpdatedAt>Última atualização: 17 de julho de 2026</UpdatedAt>
      </Hero>

      <Section>
        <Card>
          <Body>
            <h2>1. Quem somos</h2>
            <p>
              O {SITE.brand} é uma plataforma para criação e publicação de catálogos digitais,
              com acesso por QR Code e recursos de gestão de produtos, categorias, imagens e
              atendimento.
            </p>

            <h2>2. Dados pessoais tratados</h2>
            <p>Podemos tratar os seguintes dados, conforme a utilização do serviço:</p>
            <ul>
              <li>Dados cadastrais: nome, CPF/CNPJ, e-mail, telefone e endereço.</li>
              <li>Dados de acesso e segurança: IP, user-agent, data e hora de acesso.</li>
              <li>Dados operacionais: imagens, produtos cadastrados e mensagens enviadas.</li>
              <li>
                Registros legais: informações de aceite dos termos, versões aceitas e metadados
                relacionados.
              </li>
            </ul>

            <h2>3. Finalidades do tratamento</h2>
            <p>Os dados são utilizados para:</p>
            <ul>
              <li>Criar e manter a conta de usuário e a loja digital.</li>
              <li>Autenticar acessos e proteger a plataforma contra fraudes.</li>
              <li>Hospedar e disponibilizar o catálogo digital ao público.</li>
              <li>Viabilizar suporte, comunicação e continuidade do serviço.</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>

            <h2>4. Base legal</h2>
            <p>
              O tratamento ocorre com base no consentimento do titular quando aplicável, na
              execução de contrato, no cumprimento de obrigação legal e no legítimo interesse,
              observando a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>

            <h2>5. Compartilhamento de dados</h2>
            <p>
              Os dados podem ser compartilhados com operadores e fornecedores necessários para a
              operação da plataforma (ex.: hospedagem, banco de dados, envio de e-mails e
              serviços de infraestrutura), sempre sob obrigação de confidencialidade e segurança.
            </p>

            <h2>6. Armazenamento e retenção</h2>
            <p>
              Mantemos os dados pelo período necessário para cumprir as finalidades desta política
              e obrigações legais. Após esse prazo, os dados podem ser excluídos ou anonimizados,
              conforme aplicável.
            </p>

            <h2>7. Segurança da informação</h2>
            <p>
              Adotamos medidas técnicas e administrativas adequadas para proteger os dados contra
              acessos não autorizados, perda, alteração, destruição ou vazamento.
            </p>

            <h2>8. Direitos do titular</h2>
            <p>
              Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso,
              correção, portabilidade, anonimização, bloqueio, eliminação e informações sobre
              compartilhamento, além de revogar consentimentos quando essa for a base legal.
            </p>

            <h2>9. Contato</h2>
            <p>
              Para solicitações relacionadas à privacidade e proteção de dados, utilize nossos
              canais oficiais:
            </p>
            <ul>
              <li>
                Site: <a href={SITE.personalSite}>{SITE.personalSite}</a>
              </li>
              <li>
                Instagram: <a href={SITE.personalInstagram}>{SITE.personalInstagram}</a>
              </li>
              <li>
                E-mail: <a href="mailto:marcoaurelioduartebezerra@gmail.com">marcoaurelioduartebezerra@gmail.com</a>
              </li>
            </ul>

            <h2>10. Atualizações desta política</h2>
            <p>
              Esta política pode ser atualizada para refletir mudanças legais, técnicas ou
              operacionais. A versão vigente estará sempre disponível nesta página.
            </p>
          </Body>

          <LegalNote>
            Página pública para referência em lojas de aplicativos e parceiros. Link direto: /privacy{" "}
            <ExternalLink size={14} style={{ verticalAlign: "text-bottom" }} />
          </LegalNote>
        </Card>
      </Section>
    </PageContent>
  );
}