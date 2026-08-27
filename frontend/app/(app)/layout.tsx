'use client';

import { useAuth } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  return <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-10">{children}</div>;
}
