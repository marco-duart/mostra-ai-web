import { styled } from "@/theme/stitches.config";

export const Input = styled("input", {
  all: "unset",
  boxSizing: "border-box",
  width: "100%",
  padding: "$3 $4",
  borderRadius: "$md",
  backgroundColor: "$surfaceAlt",
  color: "$text",
  border: "1px solid $border",
  fontSize: "$md",
  "&::placeholder": { color: "$textSubtle" },
  "&:focus": { borderColor: "$primary" },
});

export const Textarea = styled("textarea", {
  all: "unset",
  boxSizing: "border-box",
  width: "100%",
  padding: "$3 $4",
  borderRadius: "$md",
  backgroundColor: "$surfaceAlt",
  color: "$text",
  border: "1px solid $border",
  fontSize: "$md",
  fontFamily: "$sans",
  minHeight: 120,
  resize: "vertical",
  "&::placeholder": { color: "$textSubtle" },
  "&:focus": { borderColor: "$primary" },
});

export const FieldLabel = styled("label", {
  display: "block",
  fontSize: "$sm",
  fontWeight: "$medium",
  color: "$textMuted",
  marginBottom: "$2",
});

export const FieldGroup = styled("div", {
  display: "flex",
  flexDirection: "column",
  marginBottom: "$4",
});

export const FieldError = styled("span", {
  display: "block",
  color: "$danger",
  fontSize: "$xs",
  marginTop: "$2",
});