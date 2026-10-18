import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FocusPage } from "@/components/layout/FocusPage";
import { Button } from "@/components/ui/Button";
import { FieldError, FieldGroup, FieldLabel, Input } from "@/components/ui/Input";
import { accountService } from "@/services/account.service";
import { parseApiMessage } from "@/utils/apiMessage";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Digite um e-mail válido.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await accountService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(parseApiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <FocusPage
        title="Verifique seu e-mail"
        subtitle="Se o e-mail estiver cadastrado, enviamos um link para criar uma nova senha. Ele vale por 60 minutos."
      >
        <p>Não chegou? Veja a caixa de spam ou tente novamente em alguns minutos.</p>
        <Link to="/producer/login">Voltar para o login</Link>
      </FocusPage>
    );
  }

  return (
    <FocusPage
      title="Esqueci minha senha"
      subtitle="Digite o e-mail da sua conta e enviaremos um link para criar uma nova senha."
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <FieldLabel htmlFor="forgot_email">E-mail</FieldLabel>
          <Input
            id="forgot_email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error ? <FieldError>{error}</FieldError> : null}
        </FieldGroup>
        <Button type="submit" block disabled={loading}>
          {loading ? "Enviando..." : "Enviar link"}
        </Button>
      </form>
      <p>
        <Link to="/producer/login">Voltar para o login</Link>
      </p>
    </FocusPage>
  );
}
