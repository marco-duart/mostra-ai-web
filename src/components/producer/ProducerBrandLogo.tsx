import { styled } from "@/theme/stitches.config";

type ProducerBrandLogoVariant = "square" | "rounded" | "circle";
type ProducerBrandLogoFrame = "card" | "none" | "spotlight";

const Frame = styled("div", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  variants: {
    variant: {
      square: { borderRadius: "$sm" },
      rounded: { borderRadius: "$lg" },
      circle: { borderRadius: "$pill" },
    },
    frame: {
      card: {
        border: "1px solid $border",
        backgroundColor: "$surface",
      },
      none: {
        border: "none",
        backgroundColor: "transparent",
      },
      spotlight: {
        border: "2px solid $primaryBorder",
        backgroundColor: "$surface",
        boxShadow: "0 8px 20px rgba(228,87,46,0.24)",
      },
    },
  },
  defaultVariants: {
    variant: "rounded",
    frame: "card",
  },
});

const Mark = styled("img", {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  userSelect: "none",
  pointerEvents: "none",
});

type Props = {
  size?: number;
  variant?: ProducerBrandLogoVariant;
  frame?: ProducerBrandLogoFrame;
};

export function ProducerBrandLogo({ size = 88, variant = "rounded", frame = "card" }: Props) {
  return (
    <Frame variant={variant} frame={frame} style={{ width: size, height: size }}>
      <Mark src="/logo.svg" alt="Logo MostraAi" />
    </Frame>
  );
}