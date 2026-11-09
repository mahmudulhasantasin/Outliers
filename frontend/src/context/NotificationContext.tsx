"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  HelpCircle,
  Loader2,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
}

export interface PromptOptions {
  title?: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  minLength?: number;
}

interface NotificationContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  // Confirm Dialog State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  // Prompt Dialog State
  const [promptState, setPromptState] = useState<{
    isOpen: boolean;
    options: PromptOptions;
    value: string;
    error?: string;
    resolve: (val: string | null) => void;
  } | null>(null);

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const prompt = useCallback((options: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptState({
        isOpen: true,
        options,
        value: options.defaultValue || "",
        resolve,
      });
    });
  }, []);

  const handleConfirmClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptState) return;
    const min = promptState.options.minLength || 1;
    if (promptState.value.trim().length < min) {
      setPromptState((prev) =>
        prev
          ? {
              ...prev,
              error: `Minimum ${min} characters required.`,
            }
          : null
      );
      return;
    }
    promptState.resolve(promptState.value.trim());
    setPromptState(null);
  };

  const handlePromptCancel = () => {
    if (promptState) {
      promptState.resolve(null);
      setPromptState(null);
    }
  };

  const toastMethods = {
    success: (msg: string, d?: number) => addToast("success", msg, d),
    error: (msg: string, d?: number) => addToast("error", msg, d),
    warning: (msg: string, d?: number) => addToast("warning", msg, d),
    info: (msg: string, d?: number) => addToast("info", msg, d),
  };

  return (
    <NotificationContext.Provider value={{ toast: toastMethods, confirm, prompt }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
          let borderBg = "bg-(--bg-card)/95 border-emerald-500/20 text-(--text-primary)";

          if (t.type === "error") {
            icon = <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
            borderBg = "bg-(--bg-card)/95 border-rose-500/20 text-(--text-primary)";
          } else if (t.type === "warning") {
            icon = <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
            borderBg = "bg-(--bg-card)/95 border-amber-500/20 text-(--text-primary)";
          } else if (t.type === "info") {
            icon = <Info className="w-4 h-4 text-sky-500 shrink-0" />;
            borderBg = "bg-(--bg-card)/95 border-sky-500/20 text-(--text-primary)";
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl border shadow-xl backdrop-blur-md text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${borderBg}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {icon}
                <span className="font-medium leading-relaxed break-words">{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 hover:bg-(--text-primary)/10 rounded-lg cursor-pointer transition-colors shrink-0 text-(--text-muted)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modern Confirmation Dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl sm:rounded-3xl border border-(--text-primary)/10 bg-(--bg-card) p-6 shadow-2xl space-y-4">
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto ${
                confirmState.options.variant === "danger"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                  : confirmState.options.variant === "warning"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
              }`}
            >
              {confirmState.options.variant === "danger" ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <HelpCircle className="w-6 h-6" />
              )}
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-base font-serif font-bold text-(--text-primary)">
                {confirmState.options.title || "Confirmation Required"}
              </h4>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                {confirmState.options.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold border border-(--text-primary)/15 hover:bg-(--text-primary)/5 text-(--text-primary) transition-colors cursor-pointer"
              >
                {confirmState.options.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                  confirmState.options.variant === "danger"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : confirmState.options.variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-[#E2136E] hover:opacity-90"
                }`}
              >
                {confirmState.options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Prompt Input Dialog */}
      {promptState && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handlePromptSubmit}
            className="relative w-full max-w-sm rounded-2xl sm:rounded-3xl border border-(--text-primary)/10 bg-(--bg-card) p-6 shadow-2xl space-y-4"
          >
            <div className="text-center space-y-1.5">
              <h4 className="text-base font-serif font-bold text-(--text-primary)">
                {promptState.options.title || "Input Required"}
              </h4>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                {promptState.options.message}
              </p>
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                autoFocus
                value={promptState.value}
                placeholder={promptState.options.placeholder || "Enter details..."}
                onChange={(e) =>
                  setPromptState((prev) =>
                    prev ? { ...prev, value: e.target.value, error: undefined } : null
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-(--text-primary)/15 bg-(--bg-surface) text-(--text-primary) outline-none focus:border-[#E2136E]"
              />
              {promptState.error && (
                <p className="text-[11px] text-rose-500 font-medium">{promptState.error}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handlePromptCancel}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold border border-(--text-primary)/15 hover:bg-(--text-primary)/5 text-(--text-primary) transition-colors cursor-pointer"
              >
                {promptState.options.cancelText || "Cancel"}
              </button>
              <button
                type="submit"
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#E2136E] hover:opacity-90 text-white transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {promptState.options.confirmText || "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
