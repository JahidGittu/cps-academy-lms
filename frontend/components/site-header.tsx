'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut, Shield } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
        active 
          ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {label}
    </Link>
  );
};

export const SiteHeader = () => {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-shadow">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-1.5 px-4 sm:px-6">
        <Link href="/" className="mr-auto flex items-center gap-2.5 group">
          <span className="brand-gradient flex size-9 items-center justify-center rounded-xl text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
            <GraduationCap className="size-5" />
          </span>

          <span className="leading-tight">
            <span className="block font-bold text-slate-900 tracking-tight">CPS Academy</span>
            <span className="hidden text-[11px] font-medium text-slate-500 sm:block">Learning Management</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/courses" label="Courses" />
          <NavLink href="/blog" label="Blog" />

          {loading ? null : user ? (
            <>
              <NavLink href="/dashboard" label="Dashboard" />
              {hasRole(user, 'Admin') && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <Shield className="size-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <div className="ml-3 hidden items-center gap-2.5 border-l border-slate-200 pl-3.5 sm:flex">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 uppercase shadow-xs">
                  {user.username.slice(0, 2)}
                </span>

                <div className="leading-tight text-left">
                  <span className="block text-sm font-semibold text-slate-800">{user.username}</span>
                  <span className="block text-[11px] text-slate-500 capitalize">{user.role?.name}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void logout()}
                title="Sign out"
                className="ml-1.5 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <NavLink href="/login" label="Sign in" />

              <Link
                href="/register"
                className="brand-gradient rounded-lg px-4 py-1.5 text-sm font-medium text-white shadow-xs transition hover:opacity-90 hover:shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
