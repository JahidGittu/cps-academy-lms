'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut, Shield } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';

const NavLink = ({
  href,
  label,
  isDarkTheme,
}: {
  href: string;
  label: string;
  isDarkTheme: boolean;
}) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  if (isDarkTheme) {
    return (
      <Link
        href={href}
        className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
          active
            ? 'bg-white/15 text-white font-semibold shadow-xs'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  }

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
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Header background & border styling based on scroll state and page
  const headerStyle = isHomePage
    ? scrolled
      ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 shadow-md'
      : 'bg-transparent border-b border-transparent'
    : scrolled
    ? 'bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
    : 'bg-transparent border-b border-transparent';

  const isDarkTheme = isHomePage;

  return (
    <header className={`sticky top-0 z-40 transition-all duration-200 ${headerStyle}`}>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-1.5 px-4 sm:px-6">
        <Link href="/" className="mr-auto flex items-center gap-2.5 group">
          <span className="brand-gradient flex size-9 items-center justify-center rounded-xl text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
            <GraduationCap className="size-5" />
          </span>

          <span className="leading-tight">
            <span
              className={`block font-bold tracking-tight transition-colors ${
                isDarkTheme ? 'text-white' : 'text-slate-900'
              }`}
            >
              CPS Academy
            </span>
            <span
              className={`hidden text-[11px] font-medium sm:block transition-colors ${
                isDarkTheme ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Learning Management
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/courses" label="Courses" isDarkTheme={isDarkTheme} />
          <NavLink href="/blog" label="Blog" isDarkTheme={isDarkTheme} />

          {loading ? null : user ? (
            <>
              <NavLink href="/dashboard" label="Dashboard" isDarkTheme={isDarkTheme} />
              {hasRole(user, 'Admin') && (
                <Link
                  href="/admin"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isDarkTheme
                      ? 'text-purple-300 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-700/50'
                      : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <Shield className="size-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <div
                className={`ml-3 hidden items-center gap-2.5 border-l pl-3.5 sm:flex ${
                  isDarkTheme ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 uppercase shadow-xs">
                  {user.username.slice(0, 2)}
                </span>

                <div className="leading-tight text-left">
                  <span
                    className={`block text-sm font-semibold ${
                      isDarkTheme ? 'text-slate-100' : 'text-slate-800'
                    }`}
                  >
                    {user.username}
                  </span>
                  <span
                    className={`block text-[11px] capitalize ${
                      isDarkTheme ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {user.role?.name}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void logout()}
                title="Sign out"
                className={`ml-1.5 rounded-lg p-2 transition ${
                  isDarkTheme
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <NavLink href="/login" label="Sign in" isDarkTheme={isDarkTheme} />

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
