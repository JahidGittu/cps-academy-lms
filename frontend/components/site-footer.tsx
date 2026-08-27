'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export const SiteFooter = () => {
  const pathname = usePathname();

  // Hide footer completely on internal dashboard/workspace routes
  const isWorkspaceRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/courses/new') ||
    pathname.startsWith('/blog/new') ||
    pathname.includes('/edit') ||
    pathname.includes('/students') ||
    pathname.endsWith('/quiz') ||
    pathname.startsWith('/lessons/') ||
    pathname.startsWith('/quizzes/');

  if (isWorkspaceRoute) return null;

  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand Column */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5 text-white">
              <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-white shadow-xs">
                <GraduationCap className="size-4" />
              </span>
              <span className="font-bold tracking-tight text-base">CPS Academy</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Structured online courses with sequential lesson progression and auto-graded assessments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  Course Catalogue
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

          {/* Platform Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              About
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              CPS Academy is an educational platform providing practical tracks in software engineering and database systems.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CPS Academy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="hover:text-slate-300 transition-colors">Courses</Link>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
