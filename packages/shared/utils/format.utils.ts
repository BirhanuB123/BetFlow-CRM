/**
 * Shared string formatting & display helper functions.
 */

export function formatStatusLabel(status: string | null | undefined): string {
  if (!status) return "—";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
