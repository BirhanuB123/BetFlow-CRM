"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "indigo";
  loading?: boolean;
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-rose-100 text-rose-600 border-rose-200",
      confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
      badgeText: "bg-rose-50 text-rose-700 border-rose-200",
    },
    warning: {
      iconBg: "bg-amber-100 text-amber-600 border-amber-200",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
      badgeText: "bg-amber-50 text-amber-700 border-amber-200",
    },
    indigo: {
      iconBg: "bg-primary/10 text-primary border-primary/20",
      confirmBtn: " shadow-sm",
      badgeText: "bg-primary/10 text-primary border-primary/20",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-150 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-inner",
              variantStyles.iconBg,
            )}
          >
            {variant === "danger" ? (
              <Trash2 className="size-6" />
            ) : (
              <AlertTriangle className="size-6" />
            )}
          </div>

          <div className="flex-1 pt-0.5">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 font-normal">
              {message}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-9 px-4 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-100"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            onClick={() => void onConfirm()}
            disabled={loading}
            className={cn(
              "h-9 px-4 text-xs font-bold transition-all",
              variantStyles.confirmBtn,
            )}
          >
            {loading ? "Processing…" : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
