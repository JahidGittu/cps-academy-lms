import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export const inputStyle =
  'w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

export const Field = ({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
    <input {...props} className={inputStyle} />
  </label>
);

export const TextField = ({
  label,
  ...props
}: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
    <textarea {...props} className={`${inputStyle} min-h-28`} />
  </label>
);

const variants = {
  primary: 'brand-gradient text-white shadow-xs hover:opacity-95 hover:shadow-sm active:translate-y-0.5',
  plain: 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:translate-y-0.5',
  danger: 'border border-red-300 bg-red-50/50 text-red-700 hover:bg-red-100/60 active:translate-y-0.5',
};

export const buttonStyle = (variant: keyof typeof variants = 'primary') =>
  `inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`;

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
    className={`rounded-md border border-slate-200/90 bg-white p-5 shadow-xs ${
      hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export const Alert = ({ children }: { children: React.ReactNode }) =>
  children ? (
    <div className="rounded-md border border-red-200 bg-red-50/80 px-3.5 py-2.5 text-sm text-red-700 flex items-start gap-2.5">
      <span className="font-medium">{children}</span>
    </div>
  ) : null;

export const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
    {children}
  </div>
);

const tones = {
  brand: 'border-brand-200 bg-brand-50 text-brand-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  slate: 'border-slate-200 bg-slate-100 text-slate-600',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  purple: 'border-purple-200 bg-purple-50 text-purple-700',
};

export const Badge = ({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}
  >
    {children}
  </span>
);

export const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="h-1.5 w-full overflow-hidden rounded bg-slate-100 ring-1 ring-slate-200/60">
    <div
      className="brand-gradient h-full rounded transition-all duration-500 shadow-xs"
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
  const color =
    tone === 'brand'
      ? 'text-brand-600'
      : tone === 'white'
      ? 'text-white'
      : 'text-slate-400';

  return (
    <svg
      className={`animate-spin ${className} ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const LoadingState = ({
  message = 'Loading workspace...',
  subtext = 'Please wait a moment while we fetch your data.',
  minHeight = 'min-h-[360px]',
}: {
  message?: string;
  subtext?: string;
  minHeight?: string;
}) => (
  <div
    className={`flex w-full flex-col items-center justify-center rounded-md border border-slate-200/80 bg-white/70 p-12 text-center shadow-xs backdrop-blur-xs ${minHeight}`}
  >
    <div className="relative mb-4 flex size-14 items-center justify-center">
      {/* Outer gentle pulsing ring */}
      <div className="absolute inset-0 size-14 animate-ping rounded-full bg-brand-500/15" />
      {/* Center crisp icon container */}
      <div className="relative flex size-12 items-center justify-center rounded-full bg-brand-50 border border-brand-200 shadow-xs">
        <Spinner className="size-6" tone="brand" />
      </div>
    </div>

    <h3 className="text-base font-bold text-slate-900 tracking-tight">{message}</h3>
    {subtext && <p className="mt-1 text-xs text-slate-500 max-w-xs font-medium">{subtext}</p>}
  </div>
);
