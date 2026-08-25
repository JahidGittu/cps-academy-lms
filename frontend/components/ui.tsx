import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

// The handful of shapes every form and list on the site reuses. Kept in one file so a change to
// the input border is one edit rather than fifteen.

const control =
  'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900';

export const Field = ({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
    <input {...props} className={control} />
  </label>
);

export const TextField = ({
  label,
  ...props
}: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
    <textarea {...props} className={`${control} min-h-28`} />
  </label>
);

export const Button = ({
  variant = 'primary',
  className = '',
  ...props
}: { variant?: 'primary' | 'plain' | 'danger' } & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const styles = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700',
    plain: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
    danger: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
  }[variant];

  return (
    <button
      {...props}
      className={`rounded px-4 py-2 text-sm disabled:opacity-50 ${styles} ${className}`}
    />
  );
};

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border border-slate-200 bg-white p-5 ${className}`}>{children}</div>
);

export const Alert = ({ children }: { children: React.ReactNode }) =>
  children ? (
    <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  ) : null;

export const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
    {children}
  </p>
);

export const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
    <div className="h-full bg-slate-900" style={{ width: `${percent}%` }} />
  </div>
);
