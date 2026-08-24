"use client";

import React from "react";

export interface StatusPillProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showPulse?: boolean;
}

export function StatusPill({
  status,
  size = "md",
  showPulse = true,
}: StatusPillProps) {
  const norm = status?.trim().toUpperCase().replace(/[\s-]+/g, "_") || "UNKNOWN";

  let bgClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  let pulseDotClass = "bg-slate-500";

  switch (norm) {
    case "AVAILABLE":
    case "ACTIVE":
    case "VERIFIED":
    case "SIGNED":
    case "COMPLETED":
    case "APPROVED":
    case "PAID":
    case "WON":
      bgClass = "bg-success/10 text-success border-success/20 dark:bg-success/20 dark:border-success/40";
      pulseDotClass = "bg-success";
      break;

    case "RESERVED":
    case "PENDING":
    case "PENDING_REVIEW":
    case "PENDING_SIGNATURE":
    case "SCHEDULED":
    case "QUALIFIED":
    case "PROPOSAL":
    case "WARM_LEADS":
      bgClass = "bg-warning/10 text-warning border-warning/20 dark:bg-warning/20 dark:border-warning/40";
      pulseDotClass = "bg-warning";
      break;

    case "SOLD":
    case "CONVERTED_TO_CONTRACT":
    case "TITLE_DEED":
    case "HANDOVER_KEYS":
      bgClass = "bg-info/10 text-info border-info/20 dark:bg-info/20 dark:border-info/40";
      pulseDotClass = "bg-info";
      break;

    case "CANCELLED":
    case "EXPIRED":
    case "REJECTED":
    case "LOST":
    case "OVERDUE":
    case "FAILED":
      bgClass = "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:border-destructive/40";
      pulseDotClass = "bg-destructive";
      break;

    case "NEW":
    case "COLD_LEADS":
    case "SITE_VISITORS":
    case "OTHER":
      bgClass = "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/40";
      pulseDotClass = "bg-primary";
      break;
  }

  const padding =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : size === "lg"
      ? "px-3 py-1 text-xs"
      : "px-2.5 py-0.5 text-[11px]";

  const formattedText = norm.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide uppercase transition-all duration-200 ${bgClass} ${padding}`}
    >
      {showPulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${pulseDotClass}`}
          />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${pulseDotClass}`} />
        </span>
      )}
      <span>{formattedText}</span>
    </span>
  );
}
