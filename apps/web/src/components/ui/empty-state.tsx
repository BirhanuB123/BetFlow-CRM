"use client";

import React from "react";
import { FolderOpen, Plus } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/40 p-8 text-center backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-400">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#233b66] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:bg-[#1c3054] active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
