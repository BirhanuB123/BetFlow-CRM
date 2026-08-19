"use client";

import React from "react";
import { WifiOff, Save, RotateCcw } from "lucide-react";

interface OfflineDraftBannerProps {
  isOffline?: boolean;
  hasDraft?: boolean;
  onRestoreDraft?: () => void;
  onClearDraft?: () => void;
}

export function OfflineDraftBanner({
  isOffline = false,
  hasDraft = false,
  onRestoreDraft,
  onClearDraft,
}: OfflineDraftBannerProps) {
  if (!isOffline && !hasDraft) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-900 shadow-xs dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <span className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <WifiOff className="size-4 text-amber-600 animate-pulse" />
              Offline Mode Detected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <Save className="size-4 text-amber-600" />
              Unsaved Draft Detected
            </span>
          )}
          <span className="text-amber-700/80 dark:text-amber-300/80">
            {isOffline
              ? "Your inputs are auto-saved locally so no work is lost."
              : "You have a previously saved form draft."}
          </span>
        </div>

        {hasDraft && (
          <div className="flex items-center gap-2">
            {onRestoreDraft && (
              <button
                type="button"
                onClick={onRestoreDraft}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-700 transition-colors shadow-2xs"
              >
                <RotateCcw className="size-3" />
                Restore Draft
              </button>
            )}
            {onClearDraft && (
              <button
                type="button"
                onClick={onClearDraft}
                className="text-[11px] font-medium text-amber-700 underline hover:text-amber-900 dark:text-amber-400"
              >
                Discard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
