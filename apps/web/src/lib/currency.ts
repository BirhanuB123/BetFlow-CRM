import { getSession } from "@/lib/api";

export const CURRENCIES = [
  { code: "ETB", label: "Ethiopian Birr (ETB)" },
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "KES", label: "Kenyan Shilling (KES)" },
  { code: "AED", label: "UAE Dirham (AED)" },
] as const;

export function currentCurrency() {
  return getSession()?.tenant?.currency?.toUpperCase() || "ETB";
}

export function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return String(value);
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: currentCurrency(),
    maximumFractionDigits: 2,
  }).format(amount);
}
