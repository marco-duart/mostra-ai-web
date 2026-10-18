import { useState } from "react";
import { styled } from "@/theme/stitches.config";
import { Button } from "@/components/ui/Button";
import { TableComanda } from "@/components/store/TableComanda";
import { callWaiter } from "@/services/table.service";
import type { AttendanceKind, PublicComanda, TableAttendanceStatus } from "@/types/domain";

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

const Buttons = styled("div", {
  display: "flex",
  gap: "$2",
  "& > *": { flex: 1 },
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
  comanda: PublicComanda | null;
  callAttendance: TableAttendanceStatus | null;
  billAttendance: TableAttendanceStatus | null;
  onCalled: () => void;
}

/**
 * Barra fixa no rodapé da página de mesa: acompanha a comanda (quando há) e
 * oferece "Chamar garçom" e, com comanda aberta, "Pedir a conta". O estado dos
 * dois chamados vem do servidor: com um pendente do mesmo tipo o botão fica
 * desabilitado, e quando o garçom atende a página avisa e o botão volta.
 */
export function CallWaiterButton({
  token,
  tableName,
  comanda,
  callAttendance,
  billAttendance,
  onCalled,
}: Props) {
  const [sending, setSending] = useState<AttendanceKind | null>(null);
  const [error, setError] = useState(false);

  const callPending = callAttendance?.status === "PENDING";
  const billPending = billAttendance?.status === "PENDING";

  const send = async (kind: AttendanceKind) => {
    setSending(kind);
    setError(false);
    try {
      await callWaiter(token, kind);
      onCalled();
    } catch {
      setError(true);
    } finally {
      setSending(null);
    }
  };

  return (
    <Bar>
      {tableName && <TableLabel>{tableName}</TableLabel>}
      {comanda && <TableComanda comanda={comanda} />}
      <Buttons>
        <Button
          block
          size="lg"
          onClick={() => send("CALL_WAITER")}
          disabled={sending !== null || callPending}
        >
          {callPending
            ? "Garçom chamado ✓"
            : sending === "CALL_WAITER"
              ? "Chamando..."
              : "Chamar garçom"}
        </Button>
        {comanda && (
          <Button
            block
            size="lg"
            variant="secondary"
            onClick={() => send("REQUEST_BILL")}
            disabled={sending !== null || billPending}
          >
            {billPending
              ? "Conta pedida ✓"
              : sending === "REQUEST_BILL"
                ? "Pedindo..."
                : "Pedir a conta"}
          </Button>
        )}
      </Buttons>
      {callPending && <Hint>O garçom já foi avisado. Aguarde na mesa.</Hint>}
      {billPending && <Hint>Pedido de conta enviado. O garçom já vem com ela.</Hint>}
      {!callPending && callAttendance?.status === "ATTENDED" && (
        <Hint>Atendido ✓ Precisa de mais alguma coisa? É só chamar de novo.</Hint>
      )}
      {error && <Hint>Não foi possível enviar agora. Tente novamente.</Hint>}
    </Bar>
  );
}
