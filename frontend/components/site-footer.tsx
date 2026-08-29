'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

export const SiteFooter = () => {
  const pathname = usePathname();

  // Hide footer completely on internal dashboard/workspace routes
  const isWorkspaceRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/courses/new') ||
    pathname.startsWith('/blog/new') ||
    pathname.includes('/edit') ||
    pathname.includes('/students') ||
    pathname.endsWith('/quiz') ||
    pathname.startsWith('/lessons/') ||
    pathname.startsWith('/quizzes/');

  if (isWorkspaceRoute) return null;

  return (
    <footer className="mt-auto border-t border-theme bg-surface text-muted transition-colors duration-200">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand Column */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5 text-primary">
              <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-white shadow-xs">
                <GraduationCap className="size-4" />
              </span>
              <span className="font-bold tracking-tight text-base text-primary">CPS Academy</span>
            </Link>
            <p className="text-xs text-secondary leading-relaxed max-w-sm">
              Structured online courses with sequential lesson progression and auto-graded assessments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/courses" className="hover:text-brand transition-colors">
                  Course Catalogue
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-brand transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-brand transition-colors">
                  Engineering Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              About
            </h3>
            <p className="text-xs text-secondary leading-relaxed">
              CPS Academy is an educational platform providing practical tracks in software engineering and database systems.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} CPS Academy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="hover:text-primary transition-colors">Courses</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
