'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

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

  if (user && isWorkspaceRoute) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  return <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-10">{children}</div>;
}
