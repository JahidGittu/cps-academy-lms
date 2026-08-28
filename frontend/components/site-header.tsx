'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Shield,
  ChevronDown,
  Users,
  BookOpen,
  FileText,
  UserCheck,
} from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';

const NavLink = ({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-all duration-150 ${
        active
          ? 'bg-brand-50 text-brand-700 shadow-2xs font-bold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {Icon && (
        <Icon className={`size-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
      )}
      <span>{label}</span>
    </Link>
  );
};

const roleBadgeColor: Record<string, string> = {
  Admin: 'bg-purple-50 text-purple-700 border-purple-200',
  'Content Manager': 'bg-amber-50 text-amber-700 border-amber-200',
  Instructor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const SiteHeader = () => {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDropdownOpen(false);
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  // Hide public top navbar on internal dashboard/workspace routes
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

  const headerStyle = scrolled
    ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
    : 'bg-transparent border-b-0 border-transparent shadow-none';

  const roleName = user?.role?.name ?? 'Student';
  const isAdmin = hasRole(user, 'Admin');
  const isContentManager = hasRole(user, 'Content Manager');
  const isInstructor = hasRole(user, 'Instructor');
  const isStudent = hasRole(user, 'Student');

  return (
    <header className={`sticky top-0 z-40 transition-all duration-200 ${headerStyle}`}>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-1.5 px-4 sm:px-8">
        <Link href="/" className="mr-auto flex items-center gap-2.5 group">
          <span className="brand-gradient flex size-9 items-center justify-center rounded-md text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
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

        {/* Public Navigation */}
        <nav className="flex items-center gap-1">
          <NavLink href="/courses" label="Courses" icon={Compass} />
          <NavLink href="/blog" label="Blog" icon={Newspaper} />

          {loading ? null : user ? (
            <div className="relative ml-2" ref={dropdownRef}>
              {/* Profile Avatar Toggle (Crisp Sleek Pill) */}
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white py-1 pl-1.5 pr-2.5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer ${
                  dropdownOpen ? 'ring-2 ring-brand-500/20 border-brand-400' : ''
                }`}
              >
                <span className="flex size-6.5 items-center justify-center rounded-md bg-brand-100 text-[11px] font-bold text-brand-700 uppercase shadow-2xs">
                  {user.username.slice(0, 2)}
                </span>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                  {user.username}
                </span>
                <ChevronDown
                  className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu (Crisp Sharp Borders) */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 origin-top-right rounded border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150 z-50">
                  {/* User Profile Header */}
                  <div className="px-2.5 py-2 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{user.username}</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                          roleBadgeColor[roleName] ?? 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isAdmin ? (
                          <Shield className="size-3" />
                        ) : (
                          <UserCheck className="size-3" />
                        )}
                        <span>{roleName}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                  </div>

                  {/* Contextual Role Navigation Links */}
                  <div className="py-1 space-y-0.5 text-xs font-semibold text-slate-700">
                    {/* Admin Workspace Hubs */}
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                        >
                          <Shield className="size-3.5 text-purple-600" />
                          <span>Overview</span>
                        </Link>
                        <Link
                          href="/admin/course-management"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                        >
                          <BookOpen className="size-3.5 text-violet-600" />
                          <span>Courses</span>
                        </Link>
                        <Link
                          href="/admin/blog-management"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                        >
                          <FileText className="size-3.5 text-rose-600" />
                          <span>Blogs</span>
                        </Link>
                        <Link
                          href="/admin/user-management"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                        >
                          <Users className="size-3.5 text-indigo-600" />
                          <span>Users</span>
                        </Link>
                      </>
                    )}

                    {/* Content Manager Hubs */}
                    {isContentManager && !isAdmin && (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                        >
                          <BookOpen className="size-3.5 text-brand-600" />
                          <span>Courses</span>
                        </Link>
                        <Link
                          href="/dashboard/blogs"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                        >
                          <FileText className="size-3.5 text-rose-600" />
                          <span>Blogs</span>
                        </Link>
                      </>
                    )}

                    {/* Instructor Hub */}
                    {isInstructor && (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                      >
                        <BookOpen className="size-3.5 text-brand-600" />
                        <span>Courses</span>
                      </Link>
                    )}

                    {/* Student Dashboard */}
                    {isStudent && (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                      >
                        <LayoutDashboard className="size-3.5 text-brand-600" />
                        <span>My Courses</span>
                      </Link>
                    )}
                  </div>

                  {/* Divider & Sign out */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        void logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="size-3.5 text-red-500" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center ml-2">
              <Link
                href="/login"
                className="brand-gradient rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-xs transition hover:opacity-90 hover:shadow-sm"
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
