import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const CallToAction = () => (
  <section className="mx-auto w-full max-w-6xl px-4 pb-20">
    <div className="brand-gradient flex flex-col items-start gap-5 rounded-2xl px-8 py-12 text-white sm:flex-row sm:items-center">
      <div>
        <h2 className="text-2xl font-semibold">Pick a course and start tonight</h2>
        <p className="mt-1.5 text-sm text-white/80">
          Signing up takes a minute, and the first lesson is open as soon as you enrol.
        </p>
      </div>

      <div className="ml-auto flex shrink-0 flex-wrap gap-3">
        <Link
          href="/register"
          className="group inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
        >
          Create an account
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/courses"
          className="inline-flex items-center rounded-lg border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Browse courses
        </Link>
      </div>
    </div>
  </section>
);
