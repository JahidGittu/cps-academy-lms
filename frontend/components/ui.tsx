import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export const inputStyle =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10';

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
  primary: 'brand-gradient text-white shadow-xs hover:opacity-95 hover:shadow-md hover:shadow-brand-500/20 active:translate-y-0.5',
  plain: 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:translate-y-0.5',
  danger: 'border border-red-300 bg-red-50/50 text-red-700 hover:bg-red-100/60 active:translate-y-0.5',
};

export const buttonStyle = (variant: keyof typeof variants = 'primary') =>
  `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`;

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
    className={`rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs ${
      hover ? 'transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export const Alert = ({ children }: { children: React.ReactNode }) =>
  children ? (
    <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 flex items-start gap-2.5">
      <span className="font-medium">{children}</span>
    </div>
  ) : null;

export const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
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
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
  >
    {children}
  </span>
);

export const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 ring-1 ring-slate-200/60">
    <div
      className="brand-gradient h-full rounded-full transition-all duration-500 shadow-xs"
      style={{ width: `${percent}%` }}
    />
  </div>
);
