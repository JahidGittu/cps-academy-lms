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
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal Popup Box */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-surface p-6 sm:p-7 text-center shadow-2xl transition-all animate-in zoom-in-95 duration-200 border border-theme z-10">
        {/* Close Top-Right Icon */}
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted hover:bg-elevated hover:text-primary transition cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Warning Icon */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 shadow-inner">
          <Trash2 className="size-7 stroke-[1.75]" />
        </div>

        {/* Title & Description */}
        <h3 className="text-lg sm:text-xl font-extrabold text-primary tracking-tight">
          {title}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-secondary leading-relaxed">
          {message}
        </p>

        {/* Warning Badge */}
        <div className="mt-3.5 rounded-lg badge-amber px-3 py-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs">
          <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
          <span>
            Warning: Even <code className="font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px] border border-amber-500/30">Ctrl + Z</code> won&apos;t bring this back!
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="plain"
            disabled={loading}
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 font-bold"
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
