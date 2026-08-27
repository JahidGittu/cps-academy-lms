import Link from 'next/link';
import { GraduationCap, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export const SiteFooter = () => (
  <footer className="mt-24 border-t border-slate-800 bg-slate-950 text-slate-400">
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
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
            Professional Learning Management System empowering learners through structured curricula, sequential lessons, and automated assessments.
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>

        {/* Learning Navigation */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Explore
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/courses" className="hover:text-white transition-colors">
                Courses Catalogue
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                My Dashboard
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">
                Engineering Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform Capabilities */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Features
          </h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="size-3.5 text-brand-400" />
              <span>Role-Based Access Control</span>
            </li>
            <li className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="size-3.5 text-violet-400" />
              <span>Sequential Progression</span>
            </li>
            <li className="flex items-center gap-1.5 text-slate-300">
              <BookOpen className="size-3.5 text-sky-400" />
              <span>Auto-Graded Quizzes</span>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Platform
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-performance web architecture powered by Next.js and Strapi CMS.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} CPS Academy. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/courses" className="hover:text-slate-300">Courses</Link>
          <Link href="/blog" className="hover:text-slate-300">Blog</Link>
          <Link href="/login" className="hover:text-slate-300">Sign in</Link>
        </div>
      </div>
    </div>
  </footer>
);
