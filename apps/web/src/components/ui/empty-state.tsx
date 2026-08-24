"use client";

import React from "react";
import { FolderOpen, Plus } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  hint?: string;
  icon?: React.ElementType;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  hint,
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/40 p-8 text-center backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-[#233b66] shadow-xs dark:bg-primary/20 dark:text-primary/80">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {hint && (
        <p className="mt-2 rounded-lg bg-warning/10 px-3 py-1 text-[11px] font-medium text-warning border border-warning/20/60">
          💡 {hint}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary/90 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{actionText}</span>
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-xs transition-all duration-150 hover:bg-slate-50 active:scale-[0.98]"
          >
            <span>{secondaryActionText}</span>
          </button>
        )}
      </div>
    </div>
  );
}
