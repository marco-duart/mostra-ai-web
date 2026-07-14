import { styled } from "@/theme/stitches.config";

export const Button = styled("button", {
  all: "unset",
  boxSizing: "border-box",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "$2",
  padding: "$3 $5",
  borderRadius: "$md",
  fontWeight: "$semibold",
  fontSize: "$md",
  lineHeight: 1,
  transition: "transform 120ms ease, opacity 120ms ease, background 120ms ease",
  userSelect: "none",
  textAlign: "center",
  maxWidth: "100%",
  "&:disabled": { opacity: 0.55, cursor: "not-allowed" },
  "&:active:not(:disabled)": { transform: "scale(0.98)" },
  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        color: "$primaryContrast",
      },
      secondary: {
        backgroundColor: "$surfaceAlt",
        color: "$text",
        border: "1px solid $border",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "$text",
        "&:hover:not(:disabled)": { backgroundColor: "$surfaceAlt" },
      },
    },
    size: {
      sm: { padding: "$2 $4", fontSize: "$sm" },
      md: {},
      lg: { padding: "$4 $6", fontSize: "$lg", width: "100%" },
    },
    block: {
      true: { width: "100%" },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});