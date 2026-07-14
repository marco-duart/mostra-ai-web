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