import Link from 'next/link';
import { Check, GraduationCap } from 'lucide-react';

export const AuthFrame = ({
  title,
  lead,
  aside,
  points,
  footer,
  children,
}: {
  title: string;
  lead: string;
  aside: string;
  points: string[];
  footer: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="mx-auto grid max-w-4xl overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs lg:grid-cols-2">
    <div className="p-8 sm:p-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>

      <p className="mt-1.5 text-sm text-slate-600">{lead}</p>

      <div className="mt-6">{children}</div>

      <p className="mt-6 text-sm text-slate-500">{footer}</p>
    </div>

    <div className="brand-gradient relative hidden overflow-hidden p-10 text-white lg:block">
      <div className="pointer-events-none absolute -bottom-20 -right-16 size-64 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -top-12 -left-10 size-40 rounded-full bg-white/10" />

      <div className="relative">
        <span className="flex size-11 items-center justify-center rounded-lg bg-white/15">
          <GraduationCap className="size-6" />
        </span>

        <p className="mt-6 text-lg font-semibold leading-snug">{aside}</p>

        <ul className="mt-6 space-y-3 text-sm text-white/85">
          {points.map((point) => (
            <li key={point} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />
              {point}
            </li>
          ))}
        </ul>

        <Link href="/courses" className="mt-8 inline-block text-xs font-semibold text-white/80 hover:text-white underline">
          Have a look at the courses first →
        </Link>
      </div>
    </div>
  </div>
);
