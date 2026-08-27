'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut, Shield } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-150 ${
        active
          ? 'bg-brand-50 text-brand-700 shadow-2xs font-bold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {label}
    </Link>
  );
};

export const SiteHeader = () => {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // When on dashboard or admin workspace, hide public top navbar completely
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (isDashboardRoute) return null;

  const headerStyle = scrolled
    ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
    : 'bg-transparent border-b-0 border-transparent shadow-none';

  return (
    <header className={`sticky top-0 z-40 transition-all duration-200 ${headerStyle}`}>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-1.5 px-4 sm:px-8">
        <Link href="/" className="mr-auto flex items-center gap-2.5 group">
          <span className="brand-gradient flex size-9 items-center justify-center rounded-lg text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
            <GraduationCap className="size-5" />
          </span>

          <span className="leading-tight">
            <span className="block font-extrabold text-slate-900 tracking-tight">
              CPS Academy
            </span>
            <span className="hidden text-[11px] font-medium text-slate-500 sm:block">
              Learning Management System
            </span>
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
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <Shield className="size-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Logged-in User Profile Display */}
              <div className="ml-3 hidden items-center gap-2.5 border-l border-slate-200 pl-3.5 sm:flex">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 uppercase shadow-xs">
                  {user.username.slice(0, 2)}
                </span>

                <div className="leading-tight text-left">
                  <span className="block text-sm font-semibold text-slate-800">{user.username}</span>
                  <span className="block text-[11px] capitalize text-slate-500">{user.role?.name}</span>
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
            <div className="flex items-center ml-2">
              <Link
                href="/login"
                className="brand-gradient rounded-lg px-4 py-1.5 text-sm font-semibold text-white shadow-xs transition hover:opacity-90 hover:shadow-sm"
              >
                Sign in
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
