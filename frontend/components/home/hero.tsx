import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

import { HeroArt } from '@/components/home/hero-art';

export const Hero = () => (
  <section className="relative overflow-hidden bg-white border-b border-slate-200/80 py-12 lg:py-20">
    {/* Soft Ambient Background Glows */}
    <div className="pointer-events-none absolute -left-20 top-1/4 size-96 rounded-full bg-brand-500/5 blur-3xl" />
    <div className="pointer-events-none absolute right-1/4 bottom-0 size-96 rounded-full bg-indigo-500/5 blur-3xl" />

    <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-12">
      {/* Left Column: Heading & Social Proof */}
      <div className="space-y-6 lg:col-span-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-5xl xl:text-6xl leading-[1.15]">
            <span>Learn, Master &amp;</span>
            <br />
            <span>Become a </span>
            <span className="relative inline-block whitespace-nowrap text-brand-600">
              Future Leader
              {/* Curved Underline SVG Accent */}
              <svg
                aria-hidden="true"
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                className="absolute left-0 -bottom-2 h-3 w-full text-amber-400 pointer-events-none"
              >
                <path
                  d="M3 9 Q 80 1, 150 7 T 297 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            <span className="text-slate-400 font-normal">—</span>
            <br />
            <span>Starting Today!</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            Build real-world software engineering and database skills from CPS Academy. Start your career journey today with structured, sequential learning.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/courses"
            className="brand-gradient group inline-flex items-center gap-2.5 rounded-md px-6 py-3 text-base font-bold text-white shadow-md shadow-brand-500/20 transition-all duration-200 hover:shadow-brand-500/30 hover:-translate-y-0.5"
          >
            <BookOpen className="size-5" />
            <span>Explore Courses</span>
            <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Social Proof Stack (Avatars + Text) */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <div className="flex -space-x-2 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="inline-block size-8 rounded-full ring-2 ring-white object-cover shadow-xs"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Enrolled Student"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="inline-block size-8 rounded-full ring-2 ring-white object-cover shadow-xs"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="Enrolled Student"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="inline-block size-8 rounded-full ring-2 ring-white object-cover shadow-xs"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt="Enrolled Student"
            />
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-600">
            <strong className="font-bold text-brand-600">10k+</strong> students already enrolled this month.
          </p>
        </div>
      </div>

      {/* Right Column: Hero Visual */}
      <div className="lg:col-span-6">
        <HeroArt />
      </div>
    </div>
  </section>
);
