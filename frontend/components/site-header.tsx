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
      className={`rounded px-3 py-1.5 text-sm ${
        active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </Link>
  );
};

export const SiteHeader = () => {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-3">
        <Link href="/" className="mr-auto flex items-center gap-2 font-semibold">
          <GraduationCap className="size-5" />
          CPS Academy
        </Link>

        <NavLink href="/courses" label="Courses" />
        <NavLink href="/blog" label="Blog" />

        {/* Nothing role dependent renders until the user is known, so a signed in visitor never
            sees a Sign in button flash past on the first paint. */}
        {loading ? null : user ? (
          <>
            <NavLink href="/dashboard" label="Dashboard" />
            {hasRole(user, 'Admin') && <NavLink href="/admin" label="Admin" />}

            <span className="ml-2 hidden text-sm text-slate-500 sm:inline">
              {user.username} · {user.role?.name}
            </span>

            <button
              type="button"
              onClick={() => void logout()}
              title="Sign out"
              className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            >
              <LogOut className="size-4" />
            </button>
          </>
        ) : (
          <>
            <NavLink href="/login" label="Sign in" />
            <Link
              href="/register"
              className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};
