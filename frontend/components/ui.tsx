import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export const inputStyle =
  'w-full rounded-lg border border-theme bg-surface px-3.5 py-2 text-sm text-primary outline-none transition-all placeholder:text-muted focus:border-active focus:ring-2 focus:ring-brand-500/20 shadow-2xs';

export const Field = ({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-primary">{label}</span>
    <input {...props} className={inputStyle} />
  </label>
);

export const TextField = ({
  label,
  ...props
}: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-primary">{label}</span>
    <textarea {...props} className={`${inputStyle} min-h-28`} />
  </label>
);

const variants = {
  primary: 'brand-gradient text-white shadow-md shadow-brand-500/20 hover:opacity-95 hover:shadow-lg active:translate-y-0.5 cursor-pointer',
  plain: 'border border-theme bg-surface text-primary hover:bg-elevated hover:border-active active:translate-y-0.5 shadow-2xs cursor-pointer',
  danger: 'border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 active:translate-y-0.5 cursor-pointer',
};

export const buttonStyle = (variant: keyof typeof variants = 'primary') =>
  `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`;

export const Button = ({
  variant = 'primary',
  className = '',
  ...props
}: { variant?: keyof typeof variants } & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className={`${buttonStyle(variant)} ${className}`} />
);

export const Card = ({
  children,
  hover = false,
  className = '',
}: {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}) => (
  <div
    className={`rounded-xl border border-theme bg-surface p-5 shadow-md ${
      hover ? 'transition-all duration-200 hover:-translate-y-1 hover:border-active hover:shadow-xl' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export const Alert = ({ children }: { children: React.ReactNode }) =>
  children ? (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500 flex items-start gap-2.5 shadow-xs">
      <span className="font-medium">{children}</span>
    </div>
  ) : null;

export const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-dashed border-theme bg-surface px-6 py-12 text-center text-sm text-muted shadow-sm">
    {children}
  </div>
);

const tones = {
  brand: 'border-brand-border bg-brand-subtle text-brand',
  green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-[#3fb950]',
  slate: 'border-theme bg-subtle text-secondary',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-[#e3b341]',
  purple: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-[#bc8cff]',
};

export const Badge = ({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
  >
    {children}
  </span>
);

export const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-subtle ring-1 ring-border-default">
    <div
      className="brand-gradient h-full rounded-full transition-all duration-500 shadow-xs"
      style={{ width: `${percent}%` }}
    />
  </div>
);

export const Spinner = ({
  className = 'size-5',
  tone = 'brand',
}: {
  className?: string;
  tone?: 'brand' | 'white' | 'slate';
}) => {
  const toneClass =
    tone === 'white'
      ? 'border-white border-t-transparent'
      : tone === 'slate'
        ? 'border-muted border-t-transparent'
        : 'border-brand border-t-transparent';

  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 ${toneClass} ${className}`}
    />
  );
};

export const LoadingState = ({
  message = 'Loading...',
  className = '',
  minHeight = 'min-h-48',
}: {
  message?: string;
  className?: string;
  minHeight?: string;
}) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center text-muted ${minHeight} ${className}`}>
    <Spinner className="size-6 mb-3" />
    <span className="text-xs font-medium">{message}</span>
  </div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-slate-200/70 dark:bg-white/[0.07] ${className}`} />
);
