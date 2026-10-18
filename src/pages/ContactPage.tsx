import { useEffect, useState, type FormEvent } from "react";
import { Instagram, Mail, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { Card, Section } from "@/components/ui/Card";
import { FieldGroup, FieldLabel, Input, Textarea } from "@/components/ui/Input";
import { SITE } from "@/constants/site";
import { accountService } from "@/services/account.service";
import { styled } from "@/theme/stitches.config";
import { parseApiMessage } from "@/utils/apiMessage";

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

const FormTitle = styled("h2", {
  margin: 0,
  marginBottom: "$4",
  fontSize: "$lg",
  color: "$text",
});

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Preencha nome, assunto e mensagem.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast.error("Digite um e-mail válido para a gente responder.");
      return;
    }
    setLoading(true);
    try {
      await accountService.sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSent(true);
    } catch (err) {
      toast.error(parseApiMessage(err, "Não foi possível enviar agora. Tente pelo e-mail."));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <FormTitle>Mensagem enviada</FormTitle>
        <p>Obrigado! Respondemos no e-mail que você informou assim que possível.</p>
      </>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormTitle>Envie uma mensagem</FormTitle>
      <FieldGroup>
        <FieldLabel htmlFor="contact_name">Seu nome</FieldLabel>
        <Input
          id="contact_name"
          maxLength={120}
          value={form.name}
          onChange={(event) => set("name")(event.target.value)}
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor="contact_email">Seu e-mail</FieldLabel>
        <Input
          id="contact_email"
          type="email"
          maxLength={200}
          value={form.email}
          onChange={(event) => set("email")(event.target.value)}
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor="contact_subject">Assunto</FieldLabel>
        <Input
          id="contact_subject"
          maxLength={150}
          value={form.subject}
          onChange={(event) => set("subject")(event.target.value)}
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor="contact_message">Mensagem</FieldLabel>
        <Textarea
          id="contact_message"
          maxLength={3000}
          value={form.message}
          onChange={(event) => set("message")(event.target.value)}
        />
      </FieldGroup>
      <Button type="submit" block disabled={loading}>
        {loading ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </form>
  );
}

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
          <ContactForm />
        </Card>
      </Section>

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
