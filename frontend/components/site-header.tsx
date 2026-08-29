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
import { ThemeToggle } from '@/components/theme-toggle';

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
          ? 'bg-brand-subtle text-brand border border-brand-border font-bold'
          : 'text-secondary hover:bg-elevated hover:text-primary'
      }`}
    >
      {Icon && (
        <Icon className={`size-4 ${active ? 'text-brand' : 'text-muted'}`} />
      )}
      <span>{label}</span>
    </Link>
  );
};

const roleBadgeColor: Record<string, string> = {
  Admin: 'badge-purple',
  'Content Manager': 'badge-amber',
  Instructor: 'badge-brand',
  Student: 'badge-green',
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
    pathname.startsWith('/profile') ||
    pathname.startsWith('/courses/new') ||
    pathname.startsWith('/blog/new') ||
    pathname.includes('/edit') ||
    pathname.includes('/students') ||
    pathname.endsWith('/quiz') ||
    pathname.startsWith('/lessons/') ||
    pathname.startsWith('/quizzes/');

  if (isWorkspaceRoute) return null;

  const headerStyle = scrolled
    ? 'bg-surface/90 backdrop-blur-md border-b border-theme shadow-xs'
    : 'bg-transparent border-b-0 border-transparent shadow-none';

  const roleName = user?.role?.name ?? 'Student';
  const isAdmin = hasRole(user, 'Admin');
  const isContentManager = hasRole(user, 'Content Manager');
  const isInstructor = hasRole(user, 'Instructor');
  const isStudent = hasRole(user, 'Student');

  return (
    <header className={`sticky top-0 z-40 transition-all duration-200 ${headerStyle}`}>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-8">
        <Link href="/" className="mr-auto flex items-center gap-2.5 group">
          <span className="brand-gradient flex size-9 items-center justify-center rounded-md text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
            <GraduationCap className="size-5" />
          </span>

          <span className="leading-tight">
            <span className="block font-extrabold text-primary tracking-tight">
              CPS Academy
            </span>
            <span className="hidden text-[11px] font-medium text-muted sm:block">
              Learning Management System
            </span>
          </span>
        </Link>

        {/* Public Navigation & Controls */}
        <nav className="flex items-center gap-1.5">
          <NavLink href="/courses" label="Courses" icon={Compass} />
          <NavLink href="/blog" label="Blog" icon={Newspaper} />

          {/* Theme Switcher Toggle */}
          <ThemeToggle className="ml-1" />

          {loading ? null : user ? (
            <div className="relative ml-1" ref={dropdownRef}>
              {/* Profile Avatar Toggle */}
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 rounded-lg border border-theme bg-surface py-1 pl-1.5 pr-2.5 shadow-2xs hover:bg-elevated hover:border-theme transition-all cursor-pointer ${
                  dropdownOpen ? 'ring-2 ring-brand-500/20 border-active' : ''
                }`}
              >
                <span className="flex size-6.5 items-center justify-center rounded-md bg-brand-subtle text-[11px] font-bold text-brand uppercase shadow-2xs">
                  {user.username.slice(0, 2)}
                </span>
                <span className="text-xs font-bold text-primary hidden sm:inline">
                  {user.username}
                </span>
                <ChevronDown
                  className={`size-3.5 text-muted transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-brand' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 origin-top-right rounded-lg border border-theme bg-surface p-1.5 shadow-xl ring-1 ring-black/10 animate-in fade-in zoom-in-95 duration-150 z-50">
                  {/* User Profile Header */}
                  <div className="px-2.5 py-2 border-b border-subtle">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-primary text-xs sm:text-sm truncate">{user.username}</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                          roleBadgeColor[roleName] ?? 'bg-elevated text-secondary border-theme'
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
                    <p className="text-[11px] text-muted truncate mt-0.5">{user.email}</p>
                  </div>

                  {/* Contextual Role Navigation Links */}
                  <div className="py-1 space-y-0.5 text-xs font-semibold text-secondary">
                    {/* Admin Workspace Hubs */}
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-elevated hover:text-brand transition-colors"
                        >
                          <Shield className="size-3.5 text-purple-500" />
                          <span>Overview</span>
                        </Link>
                        <Link
                          href="/admin/course-management"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-elevated hover:text-brand transition-colors"
                        >
                          <BookOpen className="size-3.5 text-violet-500" />
                          <span>Courses</span>
                        </Link>
                        <Link
                          href="/admin/blog-management"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-elevated hover:text-brand transition-colors"
                        >
                          <FileText className="size-3.5 text-rose-500" />
                          <span>Blogs</span>
                        </Link>
                        <Link
                          href="/admin/user-management"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-elevated hover:text-brand transition-colors"
                        >
                          <Users className="size-3.5 text-indigo-500" />
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
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-elevated hover:text-brand transition-colors"
                        >
                          <BookOpen className="size-3.5 text-brand" />
                          <span>Courses</span>
                        </Link>
                        <Link
                          href="/dashboard/blogs"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-elevated hover:text-brand transition-colors"
                        >
                          <FileText className="size-3.5 text-rose-500" />
                          <span>Blogs</span>
                        </Link>
                      </>
                    )}

                    {/* Instructor Hub */}
                    {isInstructor && (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-elevated hover:text-brand transition-colors"
                      >
                        <BookOpen className="size-3.5 text-brand" />
                        <span>Courses</span>
                      </Link>
                    )}

                    {/* Student Dashboard */}
                    {isStudent && (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-elevated hover:text-brand transition-colors"
                      >
                        <LayoutDashboard className="size-3.5 text-brand" />
                        <span>My Courses</span>
                      </Link>
                    )}

                    {/* Profile & Account Settings */}
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-elevated hover:text-brand transition-colors text-primary font-bold"
                    >
                      <UserCheck className="size-3.5 text-sky-400" />
                      <span>Profile & Settings</span>
                    </Link>
                  </div>

                  {/* Divider & Sign out */}
                  <div className="pt-1 border-t border-subtle">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        void logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-coral hover:bg-red-500/10 transition-colors cursor-pointer text-red-500"
                    >
                      <LogOut className="size-3.5 text-red-500" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center ml-1">
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
