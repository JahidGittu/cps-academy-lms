'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Yes, Delete Course',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={!loading ? onClose : undefined}
      />

      {/* SweetAlert Popup Box */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 sm:p-7 text-center shadow-2xl transition-all animate-in zoom-in-95 duration-200 border border-slate-200/80 z-10">
        {/* Close Top-Right Icon */}
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Animated SweetAlert Warning Icon */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-md bg-red-50 text-red-600 border border-red-100 shadow-inner">
          <Trash2 className="size-7 stroke-[1.75]" />
        </div>

        {/* Title & Description */}
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {message}
        </p>

        {/* Warning Badge with Dev Humor */}
        <div className="mt-3.5 rounded-lg bg-amber-50 border border-amber-200/80 px-3 py-2 text-[11px] font-semibold text-amber-900 flex items-center justify-center gap-1.5 shadow-2xs">
          <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
          <span>
            Warning: Even <code className="font-mono font-bold bg-amber-100/90 text-amber-900 px-1.5 py-0.5 rounded text-[10px] border border-amber-300/80">Ctrl + Z</code> won&apos;t bring this back!
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="plain"
            disabled={loading}
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 font-bold text-slate-700"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={confirmVariant}
            disabled={loading}
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-2.5 font-extrabold text-white shadow-md shadow-red-500/20 bg-red-600 hover:bg-red-700 gap-2"
          >
            {loading ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
            <span>{loading ? 'Deleting...' : confirmText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
