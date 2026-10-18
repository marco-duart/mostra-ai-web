import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FocusPage } from "@/components/layout/FocusPage";
import { Button } from "@/components/ui/Button";
import { FieldError, FieldGroup, FieldLabel, Input } from "@/components/ui/Input";
import { accountService } from "@/services/account.service";
import { parseApiMessage } from "@/utils/apiMessage";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await accountService.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(parseApiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <FocusPage
        title="Link inválido"
        subtitle="Este link de recuperação está incompleto. Peça um novo para continuar."
      >
        <Link to="/forgot-password">Pedir novo link</Link>
      </FocusPage>
    );
  }

  if (done) {
    return (
      <FocusPage
        title="Senha alterada"
        subtitle="Pronto! Agora é só entrar com a nova senha no app MostraAí (ou no painel web)."
      >
        <Link to="/producer/login">Ir para o painel do produtor</Link>
      </FocusPage>
    );
  }

  return (
    <FocusPage title="Criar nova senha" subtitle="Escolha uma senha nova para a sua conta.">
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <FieldLabel htmlFor="reset_password">Nova senha</FieldLabel>
          <Input
            id="reset_password"
            type="password"
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="reset_confirm">Confirmar nova senha</FieldLabel>
          <Input
            id="reset_confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
          {error ? <FieldError>{error}</FieldError> : null}
        </FieldGroup>
        <Button type="submit" block disabled={loading}>
          {loading ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
      {error?.toLowerCase().includes("expirado") ? (
        <p>
          <Link to="/forgot-password">Pedir um novo link</Link>
        </p>
      ) : null}
    </FocusPage>
  );
}
