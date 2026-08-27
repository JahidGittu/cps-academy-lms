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
        Course and blog content is managed directly with full administrative rights from{' '}
        <Link href="/dashboard" className="font-semibold text-brand-600 underline">
          Course Management
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
