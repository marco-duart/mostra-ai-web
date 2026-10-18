import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FocusPage } from "@/components/layout/FocusPage";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/Input";
import { accountService } from "@/services/account.service";
import { parseApiMessage } from "@/utils/apiMessage";

export function AccountDeletionCancelPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCancel = async () => {
    setError(null);
    setLoading(true);
    try {
      await accountService.cancelDeletionByToken(token);
      setDone(true);
    } catch (err) {
      setError(parseApiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <FocusPage title="Link inválido" subtitle="Este link de cancelamento está incompleto.">
        <Link to="/account-deletion">Saiba como funciona a exclusão de conta</Link>
      </FocusPage>
    );
  }

  if (done) {
    return (
      <FocusPage
        title="Exclusão cancelada"
        subtitle="Sua conta continua ativa e nada foi apagado."
      />
    );
  }

  // O cancelamento só acontece no clique: assim um antivírus ou pré-visualizador
  // de e-mail que apenas abre o link não cancela o pedido sem a pessoa querer.
  return (
    <FocusPage
      title="Cancelar exclusão da conta"
      subtitle="Você pediu para excluir sua conta do MostraAí. Se mudou de ideia, confirme abaixo que a conta deve ser mantida."
    >
      <Button block onClick={onCancel} disabled={loading}>
        {loading ? "Cancelando..." : "Manter minha conta"}
      </Button>
      {error ? <FieldError>{error}</FieldError> : null}
    </FocusPage>
  );
}
