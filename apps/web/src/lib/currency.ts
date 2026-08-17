import { getSession } from "@/lib/api";
import { CURRENCIES } from "@betflow/shared";

export { CURRENCIES };

export function currentCurrency(): string {
  return getSession()?.tenant?.currency?.toUpperCase() || "ETB";
}

export function formatCurrencyAmount(
  value: string | number | null | undefined,
  currencyCode = "ETB",
): string {
  if (value === null || value === undefined || value === "") return "—";
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return String(value);
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrency(value: string | number | null | undefined): string {
  return formatCurrencyAmount(value, currentCurrency());
}
