// app/components/ui/toast.tsx
// Sistem Notifikasi Toast Terpusat untuk MTQ Tel-U 2026
// Sesuai dengan Sistem Desain Resmi (/styleguide) — Clean, Grounded & Anti-AI Slop

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy jika dipanggil di luar provider
    return {
      showToast: (msg: string) => console.log("[Toast fallback]", msg),
      success: (msg: string) => console.log("[Toast success]", msg),
      error: (msg: string) => console.error("[Toast error]", msg),
      info: (msg: string) => console.log("[Toast info]", msg),
      warning: (msg: string) => console.warn("[Toast warning]", msg),
      removeToast: () => {},
    };
  }
  return context;
}

const TOAST_ICONS = {
  success: {
    icon: CheckCircle2,
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    accentBorder: "border-emerald-200",
  },
  error: {
    icon: AlertCircle,
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80",
    accentBorder: "border-rose-200",
  },
  warning: {
    icon: AlertTriangle,
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200/80",
    accentBorder: "border-amber-200",
  },
  info: {
    icon: Info,
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200/80",
    accentBorder: "border-sky-200",
  },
};

function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem;
  onClose: () => void;
}) {
  const meta = TOAST_ICONS[item.type] || TOAST_ICONS.info;
  const Icon = meta.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, item.duration || 3500);

    return () => clearTimeout(timer);
  }, [item.duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto flex items-start gap-3 rounded-xl border border-stone-200/90 bg-white/95 p-3.5 shadow-lg shadow-stone-900/5 backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 sm:slide-in-from-top-3 max-w-sm w-full"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.badgeBg}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {item.title && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-0.5">
            {item.title}
          </p>
        )}
        <p className="text-xs sm:text-sm font-medium text-stone-900 leading-snug">
          {item.message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="shrink-0 p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors -mr-1 -mt-1"
        aria-label="Tutup notifikasi"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", title?: string, duration?: number) => {
      if (!message) return;
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => {
        // Prevent duplicate spam of identical message
        if (prev.some((t) => t.message === message)) {
          return prev;
        }
        // Keep at most 3 newest toasts
        const next = [...prev, { id, type, message, title, duration }];
        return next.slice(-3);
      });
    },
    []
  );

  const success = useCallback(
    (message: string, title?: string) => showToast(message, "success", title),
    [showToast]
  );
  const error = useCallback(
    (message: string, title?: string) => showToast(message, "error", title),
    [showToast]
  );
  const info = useCallback(
    (message: string, title?: string) => showToast(message, "info", title),
    [showToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => showToast(message, "warning", title),
    [showToast]
  );

  const contextValue = React.useMemo(
    () => ({ showToast, success, error, info, warning, removeToast }),
    [showToast, success, error, info, warning, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Container Toast Terpusat */}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            item={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
