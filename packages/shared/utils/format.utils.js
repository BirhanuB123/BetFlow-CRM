"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStatusLabel = formatStatusLabel;
exports.formatCurrencyAmount = formatCurrencyAmount;
function formatStatusLabel(status) {
    if (!status)
        return "—";
    return status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
function formatCurrencyAmount(value, currencyCode = "ETB") {
    if (value === null || value === undefined || value === "")
        return "—";
    const amount = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(amount))
        return String(value);
    return new Intl.NumberFormat("en-ET", {
        style: "currency",
        currency: currencyCode.toUpperCase(),
        maximumFractionDigits: 2,
    }).format(amount);
}
//# sourceMappingURL=format.utils.js.map