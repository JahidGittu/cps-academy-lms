import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CallToAction = () => (
  <section className="mx-auto w-full max-w-6xl px-4 py-16">
    <div className="relative overflow-hidden rounded-3xl brand-gradient px-8 py-14 shadow-2xl shadow-brand-500/20 text-white sm:px-12 sm:py-16">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-64 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 size-64 rounded-full bg-black/10 blur-2xl" />

      <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur mb-4">
            <Sparkles className="size-3.5" />
            <span>Ready to Begin?</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start your learning journey today
          </h2>
          <p className="mt-3 text-base text-indigo-100 leading-relaxed">
            Browse our full catalogue, inspect course syllabi, and track your progress with auto-graded quizzes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 shadow-lg transition-all duration-200 hover:bg-brand-50 hover:shadow-xl hover:-translate-y-0.5"
          >
            <span>Browse Courses</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);
