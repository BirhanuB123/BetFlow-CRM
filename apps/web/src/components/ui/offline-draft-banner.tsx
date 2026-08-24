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
    <div className="mb-4 overflow-hidden rounded-xl border border-warning/20 bg-warning/10/90 p-3.5 text-xs text-warning shadow-xs dark:border-warning dark:bg-warning dark:text-warning">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <span className="flex items-center gap-1.5 font-bold text-warning dark:text-warning">
              <WifiOff className="size-4 text-warning animate-pulse" />
              Offline Mode Detected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-bold text-warning dark:text-warning">
              <Save className="size-4 text-warning" />
              Unsaved Draft Detected
            </span>
          )}
          <span className="text-warning/80 dark:text-warning/80">
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
                className="inline-flex items-center gap-1 rounded-lg bg-warning px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-warning transition-colors shadow-2xs"
              >
                <RotateCcw className="size-3" />
                Restore Draft
              </button>
            )}
            {onClearDraft && (
              <button
                type="button"
                onClick={onClearDraft}
                className="text-[11px] font-medium text-warning underline hover:text-warning dark:text-warning"
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
