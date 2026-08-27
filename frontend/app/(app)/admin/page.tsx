'use client';

import { useState } from 'react';
import Link from 'next/link';

import { RequireAuth } from '@/components/require-auth';
import { PlatformStats } from './platform-stats';
import { UserList } from './user-list';

const Panels = () => {
  const [writes, setWrites] = useState(0);

  return (
    <div className="space-y-8">
      <PlatformStats key={writes} />
      <UserList onChanged={() => setWrites((count) => count + 1)} />

      <div className="rounded-md border border-slate-200/90 bg-white p-4 text-xs text-slate-600 shadow-2xs">
        Manage platform curriculum and engineering articles directly from{' '}
        <Link href="/admin/course-management" className="font-semibold text-brand-600 underline">
          Course Management
        </Link>{' '}
        and{' '}
        <Link href="/admin/blog-management" className="font-semibold text-brand-600 underline">
          Blog Management
        </Link>
        .
      </div>
    </div>
  );
};

export default function AdminPage() {
  return (
    <RequireAuth roles={['Admin']}>
      <Panels />
    </RequireAuth>
  );
}
