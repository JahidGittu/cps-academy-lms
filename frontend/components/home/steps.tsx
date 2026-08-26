import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const steps = [
  { title: 'Create an account', body: 'Signing up gives you a student account and takes a moment.' },
  { title: 'Enrol in a course', body: 'The catalogue is open to read. Enrolling is what unlocks the lesson bodies.' },
  { title: 'Finish it and be marked', body: 'Work down the syllabus, then sit the quiz. The score is kept against your name.' },
];

export const Steps = () => (
  <section className="mx-auto w-full max-w-6xl px-4 py-16">
    <h2 className="text-2xl font-semibold tracking-tight">Getting started</h2>

    <ol className="mt-8 grid gap-4 sm:grid-cols-3">
      {steps.map((step, index) => (
        <li key={step.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {index + 1}
          </span>

          <h3 className="mt-4 font-medium">{step.title}</h3>
          <p className="mt-1.5 text-sm text-slate-600">{step.body}</p>
        </li>
      ))}
    </ol>

    <div className="brand-gradient mt-10 flex flex-col items-start gap-5 rounded-2xl px-8 py-10 text-white sm:flex-row sm:items-center">
      <div>
        <h3 className="text-xl font-semibold">Ready to start a course?</h3>
        <p className="mt-1 text-sm text-white/80">
          The catalogue is a click away, and the demo accounts are in the README.
        </p>
      </div>

      <Link
        href="/courses"
        className="group ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
      >
        Browse courses
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  </section>
);
