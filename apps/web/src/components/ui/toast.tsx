"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ToastContextValue = {
  toasts: Toast[];
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const duration = opts.duration ?? 4000;
      setToasts((prev) => [...prev.slice(-4), { ...opts, id, duration }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const success = useCallback(
    (title: string, message?: string) => toast({ type: "success", title, message }),
    [toast],
  );
  const error = useCallback(
    (title: string, message?: string) => toast({ type: "error", title, message, duration: 6000 }),
    [toast],
  );
  const warning = useCallback(
    (title: string, message?: string) => toast({ type: "warning", title, message }),
    [toast],
  );
  const info = useCallback(
    (title: string, message?: string) => toast({ type: "info", title, message }),
    [toast],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Toast Item ───────────────────────────────────────────────────────────────

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string; iconEl: ReactNode }> = {
  success: {
    bg: "bg-white",
    border: "border-l-4 border-l-emerald-500",
    icon: "text-success",
    iconEl: <CheckCircle2 className="size-5 shrink-0 text-success" />,
  },
  error: {
    bg: "bg-white",
    border: "border-l-4 border-l-rose-500",
    icon: "text-destructive",
    iconEl: <XCircle className="size-5 shrink-0 text-destructive" />,
  },
  warning: {
    bg: "bg-white",
    border: "border-l-4 border-l-amber-500",
    icon: "text-warning",
    iconEl: <AlertTriangle className="size-5 shrink-0 text-warning" />,
  },
  info: {
    bg: "bg-white",
    border: "border-l-4 border-l-blue-500",
    icon: "text-info",
    iconEl: <Info className="size-5 shrink-0 text-info" />,
  },
};

function ToastItem({ t, dismiss }: { t: Toast; dismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Animate in
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    timerRef.current = setTimeout(() => dismiss(t.id), 300);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const styles = toastStyles[t.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-lg border border-slate-200 p-4 shadow-lg transition-all duration-300",
        styles.bg,
        styles.border,
        visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0",
      )}
    >
      {styles.iconEl}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{t.title}</p>
        {t.message && (
          <p className="mt-0.5 text-xs text-slate-500">{t.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="rounded p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

// ─── Viewport (renders the stack of toasts) ───────────────────────────────────

function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} dismiss={dismiss} />
      ))}
    </div>
  );
}
