import Link from 'next/link';
import { ArrowRight, ClipboardCheck, ListOrdered, LineChart } from 'lucide-react';

// Three plain claims under the buttons. No numbers, because a made up figure on a landing page is
// worse than no figure, and the real ones live in the courses section further down where they can
// be fetched.
const points = [
  { icon: ListOrdered, label: 'Lessons open one at a time' },
  { icon: ClipboardCheck, label: 'Quizzes marked the moment you submit' },
  { icon: LineChart, label: 'Progress saved to your account' },
];

export const Hero = () => (
  <section className="relative overflow-hidden border-b border-slate-200 bg-white">
    <div className="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-brand-100 blur-3xl" />
    <div className="pointer-events-none absolute -right-32 top-16 size-96 rounded-full bg-violet-100 blur-3xl" />

    <div className="relative mx-auto w-full max-w-3xl px-4 py-20 text-center lg:py-28">
      <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
        Enrolment is open
      </span>

      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        Start a course, and <span className="text-brand-600">actually finish it</span>
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
        Enrol in minutes, work down the syllabus one lesson at a time, then sit the quiz. Come back a
        week later and the course is waiting exactly where you left it.
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
    </div>
  </section>
);
