"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  show: (tone: ToastTone, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { bg: string; fg: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-[var(--admin-success-soft)]",
    fg: "text-[var(--admin-success)]",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  error: {
    bg: "bg-[var(--admin-danger-soft)]",
    fg: "text-[var(--admin-danger)]",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  info: {
    bg: "bg-[var(--admin-primary-soft)]",
    fg: "text-[var(--admin-primary)]",
    icon: <Info className="h-5 w-5" />,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((tone: ToastTone, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, tone, message }].slice(-3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => {
          const s = toneStyles[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className={`flex items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] ${s.bg} ${s.fg} px-4 py-3 shadow-sm min-w-[280px]`}
            >
              {s.icon}
              <span className="flex-1 text-[15px] font-medium">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="opacity-70 hover:opacity-100"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
