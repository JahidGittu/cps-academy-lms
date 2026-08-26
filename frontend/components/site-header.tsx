'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </Link>
  );
};

export const SiteHeader = () => {
  const { user, loading, logout } = useAuth();

  return (
    // Sticky, because the lesson bodies and the course builder are long enough that losing the way
    // back to the dashboard halfway down is annoying.
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-1 px-4 py-3">
        <Link href="/" className="mr-auto flex items-center gap-2.5">
          <span className="brand-gradient flex size-9 items-center justify-center rounded-lg text-white">
            <GraduationCap className="size-5" />
          </span>

          <span className="leading-tight">
            <span className="block font-semibold">CPS Academy</span>
            <span className="hidden text-xs text-slate-500 sm:block">Learn, practise, prove it</span>
          </span>
        </Link>

        <NavLink href="/courses" label="Courses" />
        <NavLink href="/blog" label="Blog" />

        {/* Nothing role dependent renders until the user is known, so a signed in visitor never
            sees a Sign in button flash past on the first paint. */}
        {loading ? null : user ? (
          <>
            <NavLink href="/dashboard" label="Dashboard" />
            {hasRole(user, 'Admin') && <NavLink href="/admin" label="Admin" />}

            <span className="ml-3 hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 uppercase">
                {user.username.slice(0, 2)}
              </span>

              <span className="leading-tight">
                <span className="block text-sm font-medium">{user.username}</span>
                <span className="block text-xs text-slate-500">{user.role?.name}</span>
              </span>
            </span>

            <button
              type="button"
              onClick={() => void logout()}
              title="Sign out"
              className="ml-1 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="size-4" />
            </button>
          </>
        ) : (
          <>
            <NavLink href="/login" label="Sign in" />

            <Link
              href="/register"
              className="brand-gradient ml-1 rounded-lg px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};
