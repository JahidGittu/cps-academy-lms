import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

// The handful of shapes every form and list on the site reuses. Kept in one file so a change to
// the input border is one edit rather than fifteen.

// Exported because the quiz builder puts an input in a row of its own with a radio beside it, and
// that box still has to look like every other box on the site.
export const inputStyle =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

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
  primary: 'brand-gradient text-white shadow-sm hover:opacity-90',
  plain: 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
  danger: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
};

// Exported because some of these actions are navigations, and a link that looks like a button still
// has to be an anchor for middle click and open in new tab to work.
export const buttonStyle = (variant: keyof typeof variants = 'primary') =>
  `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${variants[variant]}`;

export const Button = ({
  variant = 'primary',
  className = '',
  ...props
}: { variant?: keyof typeof variants } & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className={`${buttonStyle(variant)} ${className}`} />
);

// hover is opt in: a card that is a link should lift under the pointer, a card that is a panel of
// text should sit still.
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
    className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
      hover ? 'transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export const Alert = ({ children }: { children: React.ReactNode }) =>
  children ? (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  ) : null;

export const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
    {children}
  </p>
);

const tones = {
  brand: 'border-brand-200 bg-brand-50 text-brand-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  slate: 'border-slate-200 bg-slate-50 text-slate-600',
};

export const Badge = ({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
  >
    {children}
  </span>
);

export const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
    <div
      className="brand-gradient h-full rounded-full transition-[width] duration-300"
      style={{ width: `${percent}%` }}
    />
  </div>
);
