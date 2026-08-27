import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { HeroArt } from '@/components/home/hero-art';

export const Hero = () => (
  <section className="relative overflow-hidden border-b border-slate-200 bg-white">
    <div className="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-brand-100 blur-3xl" />
    <div className="pointer-events-none absolute -right-24 top-24 size-96 rounded-full bg-violet-100 blur-3xl" />

    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-16 lg:grid-cols-2 lg:py-24">
      <div>
        <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          Enrolment is open
        </span>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Start a course, and <span className="text-brand-600">actually finish it</span>
        </h1>

        <p className="mt-5 max-w-lg text-lg text-slate-600">
          Enrol in minutes, work down the syllabus one lesson at a time, then sit the quiz. Come back
          a week later and the course is waiting exactly where you left it.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
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
      </div>

      <HeroArt />
    </div>
  </section>
);
