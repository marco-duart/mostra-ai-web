import { useState } from "react";
import { styled } from "@/theme/stitches.config";
import { Button } from "@/components/ui/Button";
import { callWaiter } from "@/services/table.service";

type CallState = "idle" | "sending" | "success" | "error";

const Bar = styled("div", {
  position: "sticky",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "$4",
  backgroundColor: "$surface",
  borderTop: "1px solid $border",
  display: "flex",
  flexDirection: "column",
  gap: "$2",
  zIndex: 5,
});

const TableLabel = styled("p", {
  margin: 0,
  fontSize: "$xs",
  fontWeight: "$semibold",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "$textMuted",
  textAlign: "center",
});

const Hint = styled("p", {
  margin: 0,
  fontSize: "$sm",
  color: "$textMuted",
  textAlign: "center",
});

interface Props {
  token: string;
  tableName?: string;
}

/**
 * Botão fixo no rodapé da página de mesa. Depois de chamado, fica desabilitado
 * por um tempo pra evitar cliques repetidos - o servidor já é idempotente
 * (reaproveita o atendimento pendente), mas UX melhor não deixa parecer que
 * nada aconteceu, nem incentivar o cliente a clicar várias vezes.
 */
export function CallWaiterButton({ token, tableName }: Props) {
  const [state, setState] = useState<CallState>("idle");

  const handlePress = async () => {
    setState("sending");
    try {
      await callWaiter(token);
      setState("success");
      setTimeout(() => setState("idle"), 60_000);
    } catch {
      setState("error");
    }
  };

  return (
    <Bar>
      {tableName && <TableLabel>{tableName}</TableLabel>}
      <Button
        block
        size="lg"
        onClick={handlePress}
        disabled={state === "sending" || state === "success"}
      >
        {state === "success"
          ? "Garçom chamado ✓"
          : state === "sending"
            ? "Chamando..."
            : "Chamar garçom"}
      </Button>
      {state === "success" && <Hint>O garçom já foi avisado. Aguarde na mesa.</Hint>}
      {state === "error" && (
        <Hint>Não foi possível chamar o garçom agora. Tente novamente.</Hint>
      )}
    </Bar>
  );
}
