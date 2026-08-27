'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  BookOpen,
  PlusCircle,
  FileText,
  Compass,
  LogOut,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';

export const DashboardShell = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return <div className="p-6">{children}</div>;

  const roleName = user.role?.name ?? 'Student';
  const isAdmin = hasRole(user, 'Admin');
  const isContentManager = hasRole(user, 'Content Manager');
  const isInstructor = hasRole(user, 'Instructor');
  const isStudent = hasRole(user, 'Student');

  // Build role-specific sidebar navigation links
  const navItems = [
    ...(isAdmin
      ? [
          {
            href: '/admin',
            label: 'Platform Overview',
            icon: Shield,
            badge: 'Admin',
          },
          {
            href: '/dashboard',
            label: 'Course Management',
            icon: LayoutDashboard,
          },
          {
            href: '/courses/new',
            label: 'Create Course',
            icon: PlusCircle,
          },
          {
            href: '/blog/new',
            label: 'Publish Blog Post',
            icon: FileText,
          },
        ]
      : []),

    ...((isInstructor || isContentManager) && !isAdmin
      ? [
          {
            href: '/dashboard',
            label: 'My Curriculum',
            icon: LayoutDashboard,
          },
          {
            href: '/courses/new',
            label: 'Create Course',
            icon: PlusCircle,
          },
          ...(isContentManager
            ? [
                {
                  href: '/blog/new',
                  label: 'Publish Blog Post',
                  icon: FileText,
                },
              ]
            : []),
        ]
      : []),

    ...(isStudent
      ? [
          {
            href: '/dashboard',
            label: 'My Enrolled Courses',
            icon: LayoutDashboard,
          },
        ]
      : []),

    {
      href: '/courses',
      label: 'Course Catalogue',
      icon: Compass,
    },
    {
      href: '/blog',
      label: 'Engineering Blog',
      icon: BookOpen,
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Modern Dashboard Sidebar (3 cols) */}
      <aside className="lg:col-span-3 space-y-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          {/* Workspace Title & Role Badge */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-white shadow-xs">
              <GraduationCap className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-900 truncate">
                {isAdmin ? 'Admin Console' : isInstructor ? 'Instructor Studio' : isContentManager ? 'Content Studio' : 'Student Hub'}
              </span>
              <span className="block text-[11px] font-medium text-slate-500 capitalize truncate">
                {roleName} Workspace
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-brand-50 text-brand-700 shadow-2xs font-bold border border-brand-200/80'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`size-4 shrink-0 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card & Sign Out */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 uppercase">
                {user.username.slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-800 truncate">{user.username}</span>
                <span className="block text-[10px] text-slate-400 truncate">{user.email}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void logout()}
              title="Sign out"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 shrink-0"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Canvas Area (9 cols) */}
      <main className="lg:col-span-9 space-y-6">
        <div className="pb-4 border-b border-slate-200/90">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-500">{subtitle}</p>}
        </div>

        <div>{children}</div>
      </main>
    </div>
  );
};
