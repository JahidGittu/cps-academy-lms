import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export const SiteFooter = () => (
  <footer className="mt-16 border-t border-slate-200 bg-white">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center">
      <span className="flex items-center gap-2 font-medium text-slate-700">
        <GraduationCap className="size-4" />
        CPS Academy
      </span>

      <nav className="flex gap-4 sm:ml-auto">
        <Link href="/courses" className="hover:text-slate-900">
          Courses
        </Link>
        <Link href="/blog" className="hover:text-slate-900">
          Blog
        </Link>
        <Link href="/login" className="hover:text-slate-900">
          Sign in
        </Link>
      </nav>
    </div>
  </footer>
);
