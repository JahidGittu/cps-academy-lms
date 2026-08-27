'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut, Shield } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';

const NavLink = ({
  href,
  label,
  isHeroMode,
}: {
  href: string;
  label: string;
  isHeroMode: boolean;
}) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  if (isHeroMode) {
    return (
      <Link
        href={href}
        className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
          active
            ? 'bg-white/20 text-white font-semibold shadow-xs'
            : 'text-slate-200 hover:bg-white/10 hover:text-white'
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

  // When not scrolled on homepage: text is white over dark hero mesh
  // When scrolled or on other pages: frosted glass with dark slate text
  const isHeroMode = isHomePage && !scrolled;

  const headerStyle = scrolled
    ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-xs'
    : 'bg-transparent border-b-0 border-transparent shadow-none';

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${headerStyle}`}>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-1.5 px-4 sm:px-6">
        <Link href="/" className="mr-auto flex items-center gap-2.5 group">
          <span className="brand-gradient flex size-9 items-center justify-center rounded-xl text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
            <GraduationCap className="size-5" />
          </span>

          <span className="leading-tight">
            <span
              className={`block font-bold tracking-tight transition-colors ${
                isHeroMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              CPS Academy
            </span>
            <span
              className={`hidden text-[11px] font-medium sm:block transition-colors ${
                isHeroMode ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Learning Management
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/courses" label="Courses" isHeroMode={isHeroMode} />
          <NavLink href="/blog" label="Blog" isHeroMode={isHeroMode} />

          {loading ? null : user ? (
            <>
              <NavLink href="/dashboard" label="Dashboard" isHeroMode={isHeroMode} />
              {hasRole(user, 'Admin') && (
                <Link
                  href="/admin"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isHeroMode
                      ? 'text-purple-200 bg-purple-900/50 hover:bg-purple-900/70 border border-purple-400/30'
                      : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <Shield className="size-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <div
                className={`ml-3 hidden items-center gap-2.5 border-l pl-3.5 sm:flex ${
                  isHeroMode ? 'border-white/20' : 'border-slate-200'
                }`}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 uppercase shadow-xs">
                  {user.username.slice(0, 2)}
                </span>

                <div className="leading-tight text-left">
                  <span
                    className={`block text-sm font-semibold transition-colors ${
                      isHeroMode ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {user.username}
                  </span>
                  <span
                    className={`block text-[11px] capitalize transition-colors ${
                      isHeroMode ? 'text-slate-300' : 'text-slate-500'
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
                  isHeroMode
                    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <NavLink href="/login" label="Sign in" isHeroMode={isHeroMode} />

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
