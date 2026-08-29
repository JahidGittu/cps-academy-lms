'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

let toastListeners: Array<(toasts: ToastItem[]) => void> = [];
let toastsState: ToastItem[] = [];

const notify = () => {
  toastListeners.forEach((listener) => listener([...toastsState]));
};

export const toast = {
  success: (message: string, title?: string, duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type: 'success', title: title || 'Enrollment Successful', message, duration };
    toastsState = [item, ...toastsState.slice(0, 3)];
    notify();
    setTimeout(() => toast.remove(id), duration);
  },
  error: (message: string, title?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type: 'error', title: title || 'Error', message, duration };
    toastsState = [item, ...toastsState.slice(0, 3)];
    notify();
    setTimeout(() => toast.remove(id), duration);
  },
  info: (message: string, title?: string, duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type: 'info', title: title || 'Notice', message, duration };
    toastsState = [item, ...toastsState.slice(0, 3)];
    notify();
    setTimeout(() => toast.remove(id), duration);
  },
  remove: (id: string) => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notify();
  },
};

export const ToastContainer = () => {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastListeners.push(setItems);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setItems);
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-3 ${
            item.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-400 shadow-emerald-950/40'
              : item.type === 'error'
              ? 'bg-slate-900/95 border-rose-500/40 text-rose-400 shadow-rose-950/40'
              : 'bg-slate-900/95 border-sky-500/40 text-sky-400 shadow-sky-950/40'
          }`}
        >
          {item.type === 'success' ? (
            <Sparkles className="size-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : item.type === 'error' ? (
            <AlertCircle className="size-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="size-5 text-sky-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            {item.title && (
              <h5 className="text-xs font-bold text-white tracking-wide">{item.title}</h5>
            )}
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{item.message}</p>
          </div>

          <button
            type="button"
            onClick={() => toast.remove(item.id)}
            className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
