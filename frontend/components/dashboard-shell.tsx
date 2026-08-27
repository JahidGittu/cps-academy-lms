'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  BookOpen,
  Compass,
  LogOut,
  GraduationCap,
  ChevronRight,
  FileText,
  ExternalLink,
} from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';

const getRouteMetadata = (pathname: string, roleName: string) => {
  const isStudent = roleName === 'Student';

  if (pathname === '/admin') {
    return {
      title: 'Admin Management Console',
      subtitle: 'System overview, live platform metrics, and user access role assignment.',
      breadcrumb: 'Platform Overview',
    };
  }
  if (pathname === '/dashboard/blogs') {
    return {
      title: 'Blog Management Studio',
      subtitle: 'Author, edit, publish, and manage drafts and live technical articles across the platform.',
      breadcrumb: 'Blog Management',
    };
  }
  if (pathname === '/dashboard') {
    return {
      title: isStudent ? 'My Learning Dashboard' : 'Course Management Studio',
      subtitle: isStudent
        ? 'Track your course progress, resume sequential lessons, and check graded quizzes.'
        : 'Author structured syllabus, manage sequential lessons, and monitor student completion rates.',
      breadcrumb: isStudent ? 'My Enrolled Courses' : 'Course Management',
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
      breadcrumb: 'Student Roster',
    };
  }
  if (pathname.startsWith('/courses/') && pathname.endsWith('/quiz')) {
    return {
      title: 'Course Quiz Builder',
      subtitle: 'Author and configure multiple choice questions with correct answer keys.',
      breadcrumb: 'Quiz Builder',
    };
  }
  if (pathname === '/blog/new') {
    return {
      title: 'Publish Engineering Post',
      subtitle: 'Write technical articles with Markdown formatting.',
      breadcrumb: 'New Article',
    };
  }
  if (pathname.startsWith('/blog/') && pathname.endsWith('/edit')) {
    return {
      title: 'Edit Article',
      subtitle: 'Update publication state and article content.',
      breadcrumb: 'Edit Article',
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
            href: '/dashboard/blogs',
            label: 'Blog Management',
            icon: FileText,
          },
        ]
      : []),

    ...((isInstructor || isContentManager) && !isAdmin
      ? [
          {
            href: '/dashboard',
            label: 'Course Management',
            icon: LayoutDashboard,
          },
          ...(isContentManager
            ? [
                {
                  href: '/dashboard/blogs',
                  label: 'Blog Management',
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
  ];

  const publicLinks = [
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
    <div className="min-h-screen flex bg-slate-50 text-slate-900 w-full font-sans">
      {/* 1. Left Edge Full-Height Pinned Sidebar (100vh) */}
      <aside className="w-64 min-h-screen h-screen sticky top-0 left-0 bg-white border-r border-slate-200 flex flex-col justify-between p-5 shrink-0 z-30 shadow-2xs hidden md:flex">
        <div className="space-y-6">
          {/* Brand Logo & Role Badge */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="brand-gradient flex size-9 items-center justify-center rounded-md text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
              <GraduationCap className="size-5" />
            </span>
            <div className="leading-tight min-w-0">
              <span className="block font-bold text-slate-900 tracking-tight text-base">CPS Academy</span>
              <span className="block text-[11px] font-semibold text-brand-600 capitalize">
                {isAdmin ? 'Admin Console' : isInstructor ? 'Instructor Studio' : isContentManager ? 'Content Studio' : 'Student Hub'}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Workspace Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`flex items-center justify-between gap-2.5 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
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
                    <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Public Exploration
              </span>
              {publicLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className="flex items-center justify-between gap-2.5 rounded-md px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className="size-4 shrink-0 text-slate-400" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <ExternalLink className="size-3 text-slate-300" />
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom Profile Info & Sign Out */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 uppercase shadow-2xs">
              {user.username.slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-800 truncate">{user.username}</span>
              <span className="block text-[10px] font-medium text-slate-400 capitalize truncate">{roleName}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void logout()}
            title="Sign out"
            className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 shrink-0 cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* 2. Main Dashboard Area */}
      <div className="flex-1 min-h-screen flex flex-col min-w-0">
        {/* Dashboard Top Header Bar */}
        <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Workspace
            </Link>
            <ChevronRight className="size-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800 truncate">{meta.breadcrumb}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors hidden sm:block"
            >
              Public Home ↗
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200/80">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>{roleName}</span>
            </span>
          </div>
        </header>

        {/* Canvas Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
