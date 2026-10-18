import { useState } from "react";
import { styled } from "@/theme/stitches.config";
import { formatPrice } from "@/utils/format";
import type { PublicComanda } from "@/types/domain";

const Wrap = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$2",
});

const Header = styled("button", {
  all: "unset",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "$3",
  padding: "$2 $3",
  borderRadius: "$md",
  backgroundColor: "$surfaceAlt",
  border: "1px solid $border",
  color: "$text",
  fontSize: "$sm",
  fontWeight: "$semibold",
});

const Body = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$2",
  maxHeight: "38vh",
  overflowY: "auto",
  padding: "$1 $1",
});

const Row = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  gap: "$3",
  fontSize: "$sm",
  color: "$text",
  variants: {
    strong: { true: { fontWeight: "$bold", fontSize: "$md" } },
    muted: { true: { color: "$textMuted" } },
  },
});

const Notes = styled("small", { color: "$textMuted", fontSize: "$xs" });

const Struck = styled("span", {
  textDecoration: "line-through",
  color: "$textMuted",
  marginRight: "$2",
});

const Disclaimer = styled("p", {
  margin: 0,
  fontSize: "$xs",
  color: "$textMuted",
  textAlign: "center",
});

function percentLabel(raw: string): string {
  return `${String(Number(raw)).replace(".", ",")}%`;
}

export function TableComanda({ comanda }: { comanda: PublicComanda }) {
  const [open, setOpen] = useState(false);
  const { totals } = comanda;
  const hasDiscount = Number(totals.discount_total) > 0;

  return (
    <Wrap>
      <Header type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>Sua comanda</span>
        <span>
          {formatPrice(Number(totals.total))} · {open ? "Ocultar" : "Ver itens"}
        </span>
      </Header>

      {open ? (
        <Body>
          {comanda.items.length === 0 ? (
            <Row muted>Ainda não há itens lançados.</Row>
          ) : (
            comanda.items.map((item, index) => (
              <div key={`${item.name}-${index}`}>
                <Row>
                  <span>{`${item.quantity}× ${item.name}`}</span>
                  <span>
                    {Number(item.line_discount) > 0 ? (
                      <Struck>{formatPrice(Number(item.line_gross))}</Struck>
                    ) : null}
                    {formatPrice(Number(item.line_net))}
                  </span>
                </Row>
                {item.notes ? <Notes>{item.notes}</Notes> : null}
              </div>
            ))
          )}

          <Row muted>
            <span>Itens</span>
            <span>{formatPrice(Number(totals.gross))}</span>
          </Row>
          {hasDiscount ? (
            <Row muted>
              <span>Descontos</span>
              <span>{`− ${formatPrice(Number(totals.discount_total))}`}</span>
            </Row>
          ) : null}
          <Row muted>
            <span>Subtotal</span>
            <span>{formatPrice(Number(totals.subtotal))}</span>
          </Row>
          <Row muted>
            <span>{`Taxa de serviço (${percentLabel(comanda.service_fee_percent)}) - opcional`}</span>
            <span>{formatPrice(Number(totals.service_fee))}</span>
          </Row>
          <Row strong>
            <span>Total</span>
            <span>{formatPrice(Number(totals.total))}</span>
          </Row>
          <Disclaimer>
            Acompanhamento da conta. O pagamento é feito direto com a loja, e a taxa de serviço pode
            ser retirada se você preferir.
          </Disclaimer>
        </Body>
      ) : null}
    </Wrap>
  );
}
