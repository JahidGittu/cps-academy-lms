import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

import { HeroArt } from '@/components/home/hero-art';

export const Hero = () => (
  <section className="relative overflow-hidden hero-mesh border-b border-slate-800 text-white">
    {/* Ambient Glows */}
    <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-brand-500/20 blur-3xl" />
    <div className="pointer-events-none absolute right-0 top-1/4 size-96 rounded-full bg-violet-600/20 blur-3xl" />
    <div className="pointer-events-none absolute bottom-0 left-1/3 size-72 rounded-full bg-sky-500/15 blur-3xl" />

    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-12 lg:py-28">
      <div className="lg:col-span-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-medium text-brand-300 backdrop-blur">
          <Sparkles className="size-3.5 text-brand-400" />
          <span>Interactive Learning Platform</span>
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Master new skills, and <span className="bg-gradient-to-r from-brand-300 via-indigo-200 to-violet-300 bg-clip-text text-transparent">track real progress</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-slate-300 leading-relaxed">
          Structured courses with sequential lessons, verified MCQ quizzes, and persistent progress tracking. Built for learners who finish what they start.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/courses"
            className="brand-gradient group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-200 hover:shadow-brand-500/40 hover:-translate-y-0.5"
          >
            <BookOpen className="size-4" />
            <span>Explore Courses</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-sm font-medium text-slate-200 backdrop-blur transition-all duration-200 hover:bg-slate-700/80 hover:text-white hover:border-slate-600 hover:-translate-y-0.5"
          >
            <span>Get Started</span>
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Sequential Lesson Lock</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Instant Auto-Grading</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Persistent Progress</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <HeroArt />
      </div>
    </div>
  </section>
);
