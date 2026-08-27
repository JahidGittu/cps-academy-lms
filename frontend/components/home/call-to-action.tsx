import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export const CallToAction = () => (
  <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 p-8 sm:p-14 text-white shadow-xl shadow-brand-500/10">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-64 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 size-64 rounded-full bg-white/10 blur-2xl" />

      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to Begin Your Learning Track?
        </h2>
        <p className="mt-4 text-base text-brand-100 sm:text-lg leading-relaxed">
          Create an account in seconds, enroll in foundational courses, and master concepts through hands-on sequential lessons and automated assessments.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-bold text-brand-700 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
          >
            <span>Create Free Account</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            <Compass className="size-4" />
            <span>Browse Catalogue</span>
          </Link>
        </div>
      </div>
    </div>
  </section>
);
