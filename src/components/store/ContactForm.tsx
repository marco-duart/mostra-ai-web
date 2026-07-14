import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { styled } from "@/theme/stitches.config";
import { Button } from "@/components/ui/Button";
import {
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui/Input";
import { sendContactMessage } from "@/services/store.service";
import type { ContactPayload } from "@/types/domain";

interface Props {
  slug: string;
}

const Form = styled("form", {
  display: "flex",
  flexDirection: "column",
});

type Errors = Partial<Record<keyof ContactPayload | "_global", string>>;

function validate(payload: ContactPayload): Errors {
  const errors: Errors = {};
  if (!payload.customer_name.trim()) errors.customer_name = "Informe seu nome.";
  else if (payload.customer_name.length > 120)
    errors.customer_name = "Máximo 120 caracteres.";
  if (!payload.message.trim()) errors.message = "Escreva uma mensagem.";
  else if (payload.message.length > 3000)
    errors.message = "Máximo 3000 caracteres.";
  if (
    payload.customer_email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customer_email)
  )
    errors.customer_email = "E-mail inválido.";
  if (payload.customer_phone && payload.customer_phone.length > 25)
    errors.customer_phone = "Máximo 25 caracteres.";
  return errors;
}

export function ContactForm({ slug }: Props) {
  const [values, setValues] = useState<ContactPayload>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof ContactPayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: ContactPayload = {
      customer_name: values.customer_name.trim(),
      message: values.message.trim(),
      ...(values.customer_email?.trim()
        ? { customer_email: values.customer_email.trim() }
        : {}),
      ...(values.customer_phone?.trim()
        ? { customer_phone: values.customer_phone.trim() }
        : {}),
    };
    const localErrors = validate(payload);
    if (Object.keys(localErrors).length) {
      setErrors(localErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await sendContactMessage(slug, payload);
      toast.success("Mensagem enviada! O produtor receberá em breve.");
      setValues({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        message: "",
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const data = err.response.data as {
          message?: { message?: string[] | string };
        };
        const list = data?.message?.message;
        if (Array.isArray(list)) {
          const mapped: Errors = {};
          list.forEach((msg) => {
            if (msg.startsWith("customer_name")) mapped.customer_name = msg;
            else if (msg.startsWith("customer_email")) mapped.customer_email = msg;
            else if (msg.startsWith("customer_phone")) mapped.customer_phone = msg;
            else if (msg.startsWith("message")) mapped.message = msg;
            else mapped._global = msg;
          });
          setErrors(mapped);
          toast.error("Verifique os campos do formulário.");
        } else {
          toast.error("Dados inválidos.");
        }
      } else {
        toast.error("Não foi possível enviar a mensagem. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FieldLabel htmlFor="customer_name">Seu nome *</FieldLabel>
        <Input
          id="customer_name"
          value={values.customer_name}
          onChange={handleChange("customer_name")}
          maxLength={120}
          required
        />
        {errors.customer_name && <FieldError>{errors.customer_name}</FieldError>}
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor="customer_email">E-mail (opcional)</FieldLabel>
        <Input
          id="customer_email"
          type="email"
          value={values.customer_email}
          onChange={handleChange("customer_email")}
          maxLength={255}
        />
        {errors.customer_email && <FieldError>{errors.customer_email}</FieldError>}
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor="customer_phone">Telefone/WhatsApp (opcional)</FieldLabel>
        <Input
          id="customer_phone"
          type="tel"
          value={values.customer_phone}
          onChange={handleChange("customer_phone")}
          maxLength={25}
        />
        {errors.customer_phone && <FieldError>{errors.customer_phone}</FieldError>}
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor="message">Mensagem *</FieldLabel>
        <Textarea
          id="message"
          value={values.message}
          onChange={handleChange("message")}
          maxLength={3000}
          required
        />
        {errors.message && <FieldError>{errors.message}</FieldError>}
      </FieldGroup>
      {errors._global && <FieldError>{errors._global}</FieldError>}
      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </Form>
  );
}