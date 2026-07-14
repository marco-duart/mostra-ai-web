import { styled } from "@/theme/stitches.config";

export const Card = styled("div", {
  backgroundColor: "$surface",
  border: "1px solid $border",
  borderRadius: "$lg",
  padding: "$5",
  boxShadow: "$sm",
  transition: "border-color 140ms ease, background-color 140ms ease",
});

export const Section = styled("section", {
  padding: "$5 $4",
  variants: {
    tight: { true: { padding: "$3 $4" } },
  },
});

export const SectionTitle = styled("h2", {
  margin: 0,
  marginBottom: "$4",
  fontSize: "$xl",
  fontWeight: "$bold",
  color: "$text",
});

export const Badge = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "$1",
  padding: "$1 $3",
  border: "1px solid transparent",
  borderRadius: "$pill",
  fontSize: "$xs",
  fontWeight: "$semibold",
  backgroundColor: "$surfaceAlt",
  color: "$textMuted",
  variants: {
    tone: {
      success: { backgroundColor: "rgba(34,197,94,0.15)", color: "$success" },
      danger: { backgroundColor: "rgba(239,68,68,0.15)", color: "$danger" },
      brand: {
        backgroundColor: "$primarySoft",
        color: "$primary",
        borderColor: "$primaryBorder",
      },
    },
  },
});