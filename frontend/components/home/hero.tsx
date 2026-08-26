import Link from 'next/link';
import { ArrowRight, ClipboardCheck, ListOrdered, ShieldCheck } from 'lucide-react';

// Three plain claims under the buttons. No numbers, because there is nothing here worth counting
// yet and a made up figure on a landing page is worse than no figure.
const points = [
  { icon: ListOrdered, label: 'Lessons unlock in order' },
  { icon: ClipboardCheck, label: 'Quizzes marked on the server' },
  { icon: ShieldCheck, label: 'Four roles, one permission matrix' },
];

export const Hero = () => (
  <section className="relative overflow-hidden border-b border-slate-200 bg-white">
    <div className="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-brand-100 blur-3xl" />
    <div className="pointer-events-none absolute -right-32 top-16 size-96 rounded-full bg-violet-100 blur-3xl" />

    <div className="relative mx-auto w-full max-w-3xl px-4 py-20 text-center lg:py-28">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        Learn something, <span className="text-brand-600">and prove it</span>
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
        Enrol in a course, work through the lessons in order, then take the quiz. Your score is
        marked on the server and kept, so the progress you see is the progress you did.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/courses"
          className="brand-gradient group inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          Browse courses
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/register"
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Create an account
        </Link>
      </div>

      <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
        {points.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2">
            <Icon className="size-4 text-brand-600" />
            {label}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-slate-500">
        Signing up makes you a student. Instructor and manager accounts are handed out by an admin.
      </p>
    </div>
  </section>
);
