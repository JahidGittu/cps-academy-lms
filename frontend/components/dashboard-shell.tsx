'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  BookOpen,
  Compass,
  Home,
  Newspaper,
  LogOut,
  GraduationCap,
  ChevronRight,
  FileText,
  Users,
} from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme-toggle';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

const BreadcrumbContext = createContext<{
  breadcrumbs: BreadcrumbItem[] | null;
  setBreadcrumbs: (items: BreadcrumbItem[] | null) => void;
}>({
  breadcrumbs: null,
  setBreadcrumbs: () => {},
});

export const useSetBreadcrumbs = (items: BreadcrumbItem[]) => {
  const { setBreadcrumbs } = useContext(BreadcrumbContext);
  const json = JSON.stringify(items);

  useEffect(() => {
    setBreadcrumbs(items);
    return () => setBreadcrumbs(null);
  }, [json]);
};

const getRouteMetadata = (pathname: string, roleName: string) => {
  const isStudent = roleName === 'Student';

  if (pathname === '/admin') {
    return {
      title: 'Overview',
      subtitle: 'System overview, live platform metrics, and administrative governance.',
      breadcrumb: 'Overview',
    };
  }
  if (pathname === '/admin/course-management') {
    return {
      title: 'Courses',
      subtitle: 'Author structured syllabus, manage sequential lessons, and monitor student completion rates.',
      breadcrumb: 'Courses',
    };
  }
  if (pathname === '/admin/blog-management') {
    return {
      title: 'Blogs',
      subtitle: 'Author, edit, publish, and manage drafts and live technical articles across the platform.',
      breadcrumb: 'Blogs',
    };
  }
  if (pathname === '/admin/user-management') {
    return {
      title: 'Users',
      subtitle: 'Manage user accounts, assign system permission roles, and control administrative access.',
      breadcrumb: 'Users',
    };
  }
  if (pathname === '/dashboard') {
    return {
      title: isStudent ? 'My Courses' : 'Courses',
      subtitle: isStudent
        ? 'Track your course progress, resume sequential lessons, and check graded quizzes.'
        : 'Author structured syllabus, manage sequential lessons, and monitor student completion rates.',
      breadcrumb: isStudent ? 'My Courses' : 'Courses',
    };
  }
  if (pathname === '/courses/new') {
    return {
      title: 'Create New Course',
      subtitle: 'Design curriculum, add structured lessons, and configure quizzes.',
      breadcrumb: 'New Course',
    };
  }
  if (pathname.startsWith('/courses/') && pathname.endsWith('/edit')) {
    return {
      title: 'Edit Course Curriculum',
      subtitle: 'Update lessons, syllabus ordering, and course details.',
      breadcrumb: 'Edit Course',
    };
  }
  if (pathname.startsWith('/courses/') && pathname.endsWith('/students')) {
    return {
      title: 'Class Student Progress',
      subtitle: 'Monitor student completion rates and quiz scores.',
      breadcrumb: 'Student Progress',
    };
  }
  if (pathname.startsWith('/courses/') && pathname.endsWith('/quiz')) {
    return {
      title: 'Course Quiz Builder',
      subtitle: 'Author and configure multiple choice questions with correct answer keys.',
      breadcrumb: 'Quiz Builder',
    };
  }
  if (pathname === '/blog/new' || pathname === '/admin/blog-management/new') {
    return {
      title: 'Publish Engineering Post',
      subtitle: 'Write and publish technical articles across the platform.',
      breadcrumb: 'New Article',
    };
  }
  if (
    (pathname.startsWith('/blog/') && pathname.endsWith('/edit')) ||
    (pathname.startsWith('/admin/blog-management/') && pathname.endsWith('/edit'))
  ) {
    return {
      title: 'Edit Article',
      subtitle: 'Update publication state and article content.',
      breadcrumb: 'Edit Article',
    };
  }
  if (pathname.startsWith('/profile')) {
    return {
      title: 'Account Profile & Settings',
      subtitle: 'Manage your personal profile, view role statistics, and update security credentials.',
      breadcrumb: 'Profile & Settings',
    };
  }
  if (pathname.startsWith('/lessons/')) {
    return {
      title: 'Lesson Viewer',
      subtitle: 'Complete sequential lessons and track your mastery.',
      breadcrumb: 'Lesson',
    };
  }
  if (pathname.startsWith('/quizzes/')) {
    return {
      title: 'Assessment Quiz',
      subtitle: 'Evaluate your knowledge with auto-graded multiple choice questions.',
      breadcrumb: 'Quiz',
    };
  }

  return {
    title: 'Workspace',
    subtitle: 'Manage and explore learning resources.',
    breadcrumb: 'Overview',
  };
};

export const DashboardShell = ({
  title: customTitle,
  subtitle: customSubtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState<BreadcrumbItem[] | null>(null);

  if (!user) return <div className="p-6">{children}</div>;

  const roleName = user.role?.name ?? 'Student';
  const isAdmin = hasRole(user, 'Admin');
  const isContentManager = hasRole(user, 'Content Manager');
  const isInstructor = hasRole(user, 'Instructor');
  const isStudent = hasRole(user, 'Student');

  const meta = getRouteMetadata(pathname, roleName);
  const title = customTitle || meta.title;
  const subtitle = customSubtitle !== undefined ? customSubtitle : meta.subtitle;

  // Streamlined role workspace navigation
  const navItems = [
    ...(isAdmin
      ? [
          {
            href: '/admin',
            label: 'Overview',
            icon: Shield,
          },
          {
            href: '/admin/course-management',
            label: 'Courses',
            icon: BookOpen,
          },
          {
            href: '/admin/blog-management',
            label: 'Blogs',
            icon: FileText,
          },
          {
            href: '/admin/user-management',
            label: 'Users',
            icon: Users,
          },
        ]
      : []),

    ...((isInstructor || isContentManager) && !isAdmin
      ? [
          {
            href: '/admin/course-management',
            label: 'Courses',
            icon: BookOpen,
          },
          ...(isContentManager
            ? [
                {
                  href: '/admin/blog-management',
                  label: 'Blogs',
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
            label: 'My Courses',
            icon: GraduationCap,
          },
        ]
      : []),
  ];

  const isStudioRoute =
    (pathname.startsWith('/courses/') &&
      (pathname.includes('/edit') || pathname.includes('/quiz'))) ||
    pathname === '/courses/new';

  const exitUrl = '/admin/course-management';

  return (
    <BreadcrumbContext.Provider
      value={{ breadcrumbs: customBreadcrumbs, setBreadcrumbs: setCustomBreadcrumbs }}
    >
      <div className="min-h-screen flex bg-canvas text-secondary w-full font-sans">
        {/* 1. Left Edge Full-Height Pinned Sidebar */}
        {!isStudioRoute && (
          <aside className="w-64 min-h-screen h-screen sticky top-0 left-0 bg-surface border-r border-theme flex flex-col justify-between p-5 shrink-0 z-30 shadow-2xs hidden md:flex">
            <div className="space-y-6">
              {/* Brand Logo & Role Badge */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <span className="brand-gradient flex size-9 items-center justify-center rounded-md text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
                  <GraduationCap className="size-5" />
                </span>
                <div className="leading-tight min-w-0">
                  <span className="block font-bold text-primary tracking-tight text-base">CPS Academy</span>
                  <span className="block text-[11px] font-semibold text-brand capitalize">
                    {isAdmin ? 'Admin Console' : isInstructor ? 'Instructor Console' : isContentManager ? 'Content Console' : 'Student Hub'}
                  </span>
                </div>
              </Link>

              {/* Role-Specific Workspace Navigation */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(`${item.href}/`)) ||
                    (item.href === '/admin/blog-management' &&
                      (pathname.startsWith('/admin/blog-management') ||
                        pathname === '/blog/new' ||
                        (pathname.startsWith('/blog/') && pathname.endsWith('/edit')))) ||
                    (item.href === '/admin/course-management' &&
                      (pathname.startsWith('/admin/course-management') ||
                        pathname === '/courses/new' ||
                        (pathname.startsWith('/courses/') && pathname.includes('/edit'))));

                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className={`flex items-center justify-between gap-2.5 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
                        active
                          ? 'bg-indigo-500/15 text-indigo-400 font-bold shadow-sm shadow-indigo-500/20'
                          : 'text-secondary hover:bg-elevated hover:text-primary'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`size-4 shrink-0 ${active ? 'text-indigo-400' : 'text-muted'}`} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className="rounded badge-purple px-1.5 py-0.5 text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Profile Info & Sign Out */}
            <div className="pt-4 border-t border-subtle flex items-center justify-between gap-2">
              <Link
                href="/profile"
                title="View Profile & Settings"
                className="flex items-center gap-2.5 min-w-0 flex-1 rounded-lg p-1.5 -ml-1.5 hover:bg-elevated transition group cursor-pointer"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-xs font-bold text-brand uppercase shadow-2xs group-hover:scale-105 transition-transform">
                  {user.username.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-primary truncate group-hover:text-brand transition-colors">{user.username}</span>
                  <span className="block text-[10px] font-medium text-muted capitalize truncate">{roleName}</span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => void logout()}
                title="Sign out"
                className="rounded p-2 text-muted transition hover:bg-elevated hover:text-red-500 shrink-0 cursor-pointer"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </aside>
        )}

        {/* 2. Main Dashboard & Studio Area */}
        <div className="flex-1 min-h-screen flex flex-col min-w-0">
          {/* Top Header Bar */}
          <header className="h-16 border-b border-theme bg-surface/90 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
            {/* Header Content: Studio Mode vs Dashboard Mode */}
            {isStudioRoute ? (
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href={exitUrl}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-theme bg-surface px-3 py-1.5 text-xs font-bold text-primary hover:bg-elevated hover:text-sky-400 transition shadow-2xs"
                >
                  <ChevronRight className="size-3.5 rotate-180 text-muted" />
                  <span>Back to Courses</span>
                </Link>

                <div className="h-4 w-px bg-theme hidden sm:block" />

                {/* Hierarchical Studio Breadcrumb */}
                {customBreadcrumbs && customBreadcrumbs.length > 0 && (
                  <nav className="hidden sm:flex items-center gap-2 text-xs text-muted font-medium truncate" aria-label="Breadcrumb">
                    {customBreadcrumbs.map((crumb, idx) => {
                      const isLast = idx === customBreadcrumbs.length - 1;

                      return (
                        <span key={idx} className="inline-flex items-center gap-2">
                          {idx > 0 && <ChevronRight className="size-3 text-muted shrink-0" />}
                          {crumb.href && !isLast ? (
                            <Link
                              href={crumb.href}
                              className="hover:text-brand transition-colors max-w-[200px] truncate"
                            >
                              {crumb.label}
                            </Link>
                          ) : (
                            <span className="font-bold text-primary truncate max-w-[280px]">
                              {crumb.label}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </nav>
                )}
              </div>
            ) : (
              <nav className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/"
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    pathname === '/'
                      ? 'bg-indigo-500/15 text-indigo-400 font-bold shadow-sm shadow-indigo-500/20'
                      : 'text-secondary hover:bg-elevated hover:text-primary'
                  }`}
                >
                  <Home className={`size-3.5 sm:size-4 ${pathname === '/' ? 'text-indigo-400' : 'text-muted'}`} />
                  <span>Home</span>
                </Link>

                <Link
                  href="/courses"
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    pathname.startsWith('/courses')
                      ? 'bg-indigo-500/15 text-indigo-400 font-bold shadow-sm shadow-indigo-500/20'
                      : 'text-secondary hover:bg-elevated hover:text-primary'
                  }`}
                >
                  <Compass className={`size-3.5 sm:size-4 ${pathname.startsWith('/courses') ? 'text-indigo-400' : 'text-muted'}`} />
                  <span>Courses</span>
                </Link>

                <Link
                  href="/blog"
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    pathname.startsWith('/blog')
                      ? 'bg-indigo-500/15 text-indigo-400 font-bold shadow-sm shadow-indigo-500/20'
                      : 'text-secondary hover:bg-elevated hover:text-primary'
                  }`}
                >
                  <Newspaper className={`size-3.5 sm:size-4 ${pathname.startsWith('/blog') ? 'text-indigo-400' : 'text-muted'}`} />
                  <span>Blog</span>
                </Link>
              </nav>
            )}

            {/* Right Header Status, Profile Avatar & Theme Switcher */}
            <div className="flex items-center gap-2.5 shrink-0">
              <ThemeToggle size="sm" />

              <Link
                href="/profile"
                title="View Profile & Settings"
                className="flex items-center gap-2 rounded-lg border border-theme bg-surface py-1 pl-1.5 pr-2.5 shadow-2xs hover:bg-elevated hover:border-active transition group cursor-pointer"
              >
                <span className="flex size-6.5 items-center justify-center rounded-full bg-brand-subtle text-[11px] font-black text-brand uppercase shadow-2xs group-hover:scale-105 transition-transform">
                  {user.username.slice(0, 2)}
                </span>
                <span className="text-xs font-bold text-primary hidden sm:inline group-hover:text-brand transition-colors">
                  {user.username}
                </span>
                <span className="size-1.5 rounded-full bg-emerald-500" />
              </Link>

              {isStudioRoute && (
                <button
                  type="button"
                  onClick={() => void logout()}
                  title="Sign out"
                  className="rounded p-1.5 text-muted transition hover:bg-elevated hover:text-red-500 cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              )}
            </div>
          </header>

          {/* Canvas Body */}
          <main className={`flex-1 p-6 sm:p-8 w-full mx-auto space-y-6 ${isStudioRoute ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
            {/* Hierarchical Breadcrumb Navigation on standard nested pages */}
            {!isStudioRoute && customBreadcrumbs && customBreadcrumbs.length > 0 && (
              <nav className="flex items-center gap-2 text-xs text-muted font-medium flex-wrap" aria-label="Breadcrumb">
                {customBreadcrumbs.map((crumb, idx) => {
                  const isLast = idx === customBreadcrumbs.length - 1;

                  return (
                    <span key={idx} className="inline-flex items-center gap-2">
                      {idx > 0 && <ChevronRight className="size-3.5 text-muted shrink-0" />}
                      {crumb.href && !isLast ? (
                        <Link
                          href={crumb.href}
                          className="hover:text-brand transition-colors max-w-[240px] truncate"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="font-bold text-primary truncate max-w-[340px]">
                          {crumb.label}
                        </span>
                      )}
                    </span>
                  );
                })}
              </nav>
            )}

            {children}
          </main>
        </div>
      </div>
    </BreadcrumbContext.Provider>
  );
};
