'use client';

import { useState } from 'react';
import Link from 'next/link';

import { RequireAuth } from '@/components/require-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { PlatformStats } from './platform-stats';
import { UserList } from './user-list';

const Panels = () => {
  const [writes, setWrites] = useState(0);

  return (
    <DashboardShell
      title="Admin Management Console"
      subtitle="System overview, live platform metrics, and user access role assignment."
    >
      <div className="space-y-8">
        <PlatformStats key={writes} />
        <UserList onChanged={() => setWrites((count) => count + 1)} />

        <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-xs text-slate-500">
          Course and blog content is managed directly with full administrative rights from{' '}
          <Link href="/dashboard" className="font-semibold text-brand-600 underline">
            Course Management
          </Link>
          .
        </div>
      </div>
    </DashboardShell>
  );
};

export default function AdminPage() {
  return (
    <RequireAuth roles={['Admin']}>
      <Panels />
    </RequireAuth>
  );
}
