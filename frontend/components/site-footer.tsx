import Link from 'next/link';
import { GraduationCap, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export const SiteFooter = () => (
  <footer className="mt-24 border-t border-slate-800 bg-slate-950 text-slate-400">
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-white shadow-xs">
              <GraduationCap className="size-4" />
            </span>
            <span className="font-bold tracking-tight text-base">CPS Academy</span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Modern Learning Management System with strict 4-role access control, sequential progression, and server auto-graded assessments.
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>

        {/* Learning Navigation */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Learning Platform
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/courses" className="hover:text-white transition-colors">
                Course Catalogue
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Student Dashboard
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">
                Engineering Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Security & Architecture */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Architecture
          </h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="size-3.5 text-brand-400" />
              <span>4-Role Access Matrix</span>
            </li>
            <li className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="size-3.5 text-violet-400" />
              <span>Dynamic Progress Tracking</span>
            </li>
            <li className="flex items-center gap-1.5 text-slate-300">
              <BookOpen className="size-3.5 text-sky-400" />
              <span>Server-side Auto-Grading</span>
            </li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Stack & Deployment
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Frontend built with Next.js 16 on Vercel. Headless CMS powered by Strapi 5 & PostgreSQL on Railway.
          </p>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} CPS Academy. All rights reserved.</p>
        <p className="font-medium text-slate-400">Junior Software Engineer Project Submission</p>
      </div>
    </div>
  </footer>
);
