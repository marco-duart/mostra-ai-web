import { keyframes, styled } from "@/theme/stitches.config";

const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

const pulse = keyframes({
  "0%, 100%": { opacity: 0.85 },
  "50%": { opacity: 1 },
});

const Wrap = styled("div", {
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "$3",
  color: "$textMuted",
});

const Spinner = styled("div", {
  width: 76,
  height: 76,
  borderRadius: "$pill",
  border: "3px solid $primarySoft",
  borderTopColor: "$primary",
  animation: `${spin} 1s linear infinite`,
  display: "grid",
  placeItems: "center",
  boxShadow: "$sm",
});

const Logo = styled("img", {
  width: 34,
  height: 34,
  animation: `${pulse} 1.2s ease-in-out infinite`,
  userSelect: "none",
  pointerEvents: "none",
});

const Label = styled("span", {
  fontSize: "$sm",
  color: "$textMuted",
});

interface Props {
  label?: string;
}

export function LogoSpinner({ label = "Carregando..." }: Props) {
  return (
    <Wrap role="status" aria-live="polite" aria-label={label}>
      <Spinner>
        <Logo src="/logo.svg" alt="MostraAi" />
      </Spinner>
      <Label>{label}</Label>
    </Wrap>
  );
}
