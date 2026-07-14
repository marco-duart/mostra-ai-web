import { createStitches } from "@stitches/react";

export const {
  styled,
  css,
  globalCss,
  keyframes,
  theme,
  createTheme,
  config,
  getCssText,
} = createStitches({
  theme: {
    colors: {
      // Neutral palette (dark-first, mobile focused)
      bg: "#0f0f10",
      surface: "#18181b",
      surfaceAlt: "#212125",
      border: "rgba(255,255,255,0.08)",
      text: "#f5f5f7",
      textMuted: "#a1a1aa",
      textSubtle: "#71717a",
      // Brand (overridable per-store at runtime via CSS vars)
      primary: "var(--store-primary, #E4572E)",
      primaryContrast: "var(--store-primary-contrast, #ffffff)",
      primarySoft: "var(--store-primary-soft, rgba(228,87,46,0.18))",
      primaryBorder: "var(--store-primary-border, rgba(228,87,46,0.45))",
      secondary: "var(--store-secondary, #1A1A1A)",
      secondarySoft: "var(--store-secondary-soft, #171718)",
      danger: "#ef4444",
      success: "#22c55e",
      warning: "#f59e0b",
    },
    space: {
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "20px",
      6: "24px",
      7: "32px",
      8: "40px",
      9: "56px",
    },
    radii: {
      sm: "6px",
      md: "10px",
      lg: "16px",
      xl: "24px",
      pill: "999px",
    },
    fontSizes: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "18px",
      xl: "22px",
      "2xl": "28px",
      "3xl": "36px",
    },
    fontWeights: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    fonts: {
      sans: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    },
    shadows: {
      sm: "0 1px 2px rgba(0,0,0,0.2)",
      md: "0 4px 12px rgba(0,0,0,0.25)",
      lg: "0 12px 32px rgba(0,0,0,0.35)",
    },
    sizes: {
      containerMobile: "560px",
    },
  },
  media: {
    sm: "(min-width: 480px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
  },
});

export const globalStyles = globalCss({
  "*, *::before, *::after": { boxSizing: "border-box" },
  "html, body, #root": {
    margin: 0,
    padding: 0,
    minHeight: "100dvh",
    backgroundColor: "$bg",
    color: "$text",
    fontFamily: "$sans",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
  body: {
    fontSize: "$md",
    lineHeight: 1.5,
  },
  a: { color: "inherit", textDecoration: "none" },
  button: { fontFamily: "inherit" },
  "a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible": {
    outline: "2px solid $colors$primaryBorder",
    outlineOffset: "2px",
  },
  img: { display: "block", maxWidth: "100%" },
});