"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.daysRemaining = daysRemaining;
exports.timeAgo = timeAgo;
function formatDate(dateInput) {
    if (!dateInput)
        return "—";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (Number.isNaN(date.getTime()))
        return String(dateInput);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
function daysRemaining(expiryInput) {
    if (!expiryInput)
        return 0;
    const expiry = typeof expiryInput === "string" ? new Date(expiryInput) : expiryInput;
    const diff = expiry.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
function timeAgo(dateInput) {
    if (!dateInput)
        return "—";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const diff = Date.now() - date.getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1)
        return "just now";
    if (mins < 60)
        return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 30)
        return `${days}d ago`;
    return date.toLocaleDateString();
}
//# sourceMappingURL=date.utils.js.map