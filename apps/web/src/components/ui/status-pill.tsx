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
      bgClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
      pulseDotClass = "bg-emerald-500";
      break;

    case "RESERVED":
    case "PENDING":
    case "PENDING_REVIEW":
    case "PENDING_SIGNATURE":
    case "SCHEDULED":
    case "QUALIFIED":
    case "PROPOSAL":
    case "WARM_LEADS":
      bgClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
      pulseDotClass = "bg-amber-500";
      break;

    case "SOLD":
    case "CONVERTED_TO_CONTRACT":
    case "TITLE_DEED":
    case "HANDOVER_KEYS":
      bgClass = "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800/60";
      pulseDotClass = "bg-sky-500";
      break;

    case "CANCELLED":
    case "EXPIRED":
    case "REJECTED":
    case "LOST":
    case "OVERDUE":
    case "FAILED":
      bgClass = "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/60";
      pulseDotClass = "bg-rose-500";
      break;

    case "NEW":
    case "COLD_LEADS":
    case "SITE_VISITORS":
    case "OTHER":
      bgClass = "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60";
      pulseDotClass = "bg-indigo-500";
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
