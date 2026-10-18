const SERVICE_FEE_PATTERN = /^\d{1,3}([.,]\d{1,2})?$/;

export type ServiceFeeParse = { value: number; error: null } | { value: null; error: string };

export function parseServiceFee(input: string): ServiceFeeParse {
  const text = input.trim();
  if (!text) {
    return { value: null, error: "Informe a taxa de serviço (use 0 se não houver)." };
  }
  if (!SERVICE_FEE_PATTERN.test(text)) {
    return { value: null, error: "Use um número como 10 ou 12,5." };
  }
  return { value: Number(text.replace(",", ".")), error: null };
}

export function formatServiceFee(percent: number): string {
  return `${String(percent).replace(".", ",")}%`;
}
