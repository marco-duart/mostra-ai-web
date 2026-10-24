export type DocumentKind = "CPF" | "CNPJ";

const CNPJ_FORMAT = /^[A-Z0-9]{12}\d{2}$/;
const CNPJ_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export const sanitizeDocument = (value: string): string =>
  value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

const cpfCheckDigit = (digits: number[]): number => {
  const sum = digits.reduce((acc, digit, index) => acc + digit * (digits.length + 1 - index), 0);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
};

export const isValidCpf = (value: string): boolean => {
  const document = sanitizeDocument(value);
  if (!/^\d{11}$/.test(document)) return false;
  if (/^(\d)\1{10}$/.test(document)) return false;

  const digits = document.split("").map(Number);
  return (
    cpfCheckDigit(digits.slice(0, 9)) === digits[9] &&
    cpfCheckDigit(digits.slice(0, 10)) === digits[10]
  );
};

const cnpjCheckDigit = (chars: string[]): number => {
  const weights = CNPJ_WEIGHTS.slice(CNPJ_WEIGHTS.length - chars.length);
  const sum = chars.reduce(
    (acc, char, index) => acc + (char.charCodeAt(0) - 48) * (weights[index] ?? 0),
    0,
  );
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
};

export const isValidCnpj = (value: string): boolean => {
  const document = sanitizeDocument(value);
  if (!CNPJ_FORMAT.test(document)) return false;
  if (/^(.)\1{13}$/.test(document)) return false;

  const chars = document.split("");
  return (
    cnpjCheckDigit(chars.slice(0, 12)) === Number(chars[12]) &&
    cnpjCheckDigit(chars.slice(0, 13)) === Number(chars[13])
  );
};

export const documentError = (value: string, type: DocumentKind): string | null => {
  if (type === "CPF") return isValidCpf(value) ? null : "CPF inválido. Confira os 11 dígitos.";
  return isValidCnpj(value) ? null : "CNPJ inválido. Confira os 14 caracteres.";
};
