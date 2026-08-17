/**
 * Shared date formatting & calculation utilities.
 */

export function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return String(dateInput);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysRemaining(expiryInput: Date | string | null | undefined): number | null {
  if (!expiryInput) return null;
  const expiry = typeof expiryInput === "string" ? new Date(expiryInput) : expiryInput;
  const target = expiry.getTime();
  if (Number.isNaN(target)) return null;
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function timeAgo(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
