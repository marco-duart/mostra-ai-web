import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FocusPage } from "@/components/layout/FocusPage";
import { accountService } from "@/services/account.service";
import { parseApiMessage } from "@/utils/apiMessage";

type State = { kind: "loading" } | { kind: "ok" } | { kind: "error"; message: string };

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>(
    token ? { kind: "loading" } : { kind: "error", message: "Este link está incompleto." },
  );
  // O StrictMode roda o efeito duas vezes em desenvolvimento; o token é de uso único.
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    accountService
      .verifyEmail(token)
      .then(() => setState({ kind: "ok" }))
      .catch((err: unknown) => setState({ kind: "error", message: parseApiMessage(err) }));
  }, [token]);

  if (state.kind === "loading") {
    return <FocusPage title="Confirmando seu e-mail..." />;
  }
  if (state.kind === "ok") {
    return (
      <FocusPage
        title="E-mail confirmado"
        subtitle="Obrigado! Seu e-mail foi confirmado e você já pode voltar ao app."
      >
        <Link to="/producer/login">Ir para o painel do produtor</Link>
      </FocusPage>
    );
  }
  return (
    <FocusPage title="Não foi possível confirmar" subtitle={state.message}>
      <p>
        O link pode ter expirado (ele vale por 48 horas). Entre no app MostraAí e peça um novo
        e-mail de confirmação.
      </p>
    </FocusPage>
  );
}
