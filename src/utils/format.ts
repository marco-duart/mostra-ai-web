export function formatPrice(value: number): string {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function safeHex(color: string | undefined | null, fallback: string): string {
  if (color && HEX_COLOR.test(color)) return color;
  return fallback;
}

type RGB = { r: number; g: number; b: number };

function normalizeHex(hex: string): string {
  const clean = hex.trim();
  if (clean.length === 4) {
    const r = clean[1];
    const g = clean[2];
    const b = clean[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return clean.toUpperCase();
}

function hexToRgb(hex: string): RGB {
  const n = normalizeHex(hex).replace("#", "");
  return {
    r: Number.parseInt(n.slice(0, 2), 16),
    g: Number.parseInt(n.slice(2, 4), 16),
    b: Number.parseInt(n.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const to = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

function mixHex(baseHex: string, mixWithHex: string, ratio: number): string {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixWithHex);
  return rgbToHex({
    r: base.r + (mix.r - base.r) * safeRatio,
    g: base.g + (mix.g - base.g) * safeRatio,
    b: base.b + (mix.b - base.b) * safeRatio,
  });
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastTextFor(bgHex: string): string {
  return relativeLuminance(bgHex) > 0.55 ? "#0F0F10" : "#FFFFFF";
}

export function getStoreThemeVars(
  primaryInput: string | undefined | null,
  secondaryInput: string | undefined | null,
): Record<string, string> {
  const primary = safeHex(primaryInput, "#E4572E");
  const secondary = safeHex(secondaryInput, "#1A1A1A");

  // Blend producer colors into semantic shades so brand presence stays controlled.
  const primarySoft = mixHex(primary, "#0F0F10", 0.78);
  const primaryBorder = mixHex(primary, "#FFFFFF", 0.24);
  const secondarySoft = mixHex(secondary, "#0F0F10", 0.6);

  return {
    "--store-primary": primary,
    "--store-primary-contrast": contrastTextFor(primary),
    "--store-primary-soft": primarySoft,
    "--store-primary-border": primaryBorder,
    "--store-secondary": secondary,
    "--store-secondary-soft": secondarySoft,
  };
}

export function formatWhatsappHref(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function instagramHref(handle: string): string {
  const clean = handle.replace(/^@/, "").trim();
  return `https://instagram.com/${clean}`;
}

export function deliveryModeLabel(mode: string): string {
  switch (mode) {
    case "DELIVERY_ONLY":
      return "Somente entrega";
    case "PICKUP_ONLY":
      return "Somente retirada";
    case "BOTH":
      return "Entrega e retirada";
    case "NEGOTIATE":
      return "A combinar";
    default:
      return mode;
  }
}