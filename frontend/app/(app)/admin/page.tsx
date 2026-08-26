'use client';

import { useState } from 'react';
import Link from 'next/link';

import { RequireAuth } from '@/components/require-auth';
import { PlatformStats } from './platform-stats';
import { UserList } from './user-list';

const Panels = () => {
  // The stats include a headcount per role, so changing someone's role leaves that panel out of
  // date. Counting the write and using it as a key remounts the panel, which asks the server again
  // instead of trying to patch the number from here.
  const [writes, setWrites] = useState(0);

  return (
    <div className="space-y-8">
      <PlatformStats key={writes} />
      <UserList onChanged={() => setWrites((count) => count + 1)} />

      {/* Courses, lessons and the blog are edited on the same screens the instructors and managers
          use. An admin passes every ownership check, so those screens already show the whole
          library rather than needing a second copy here. */}
      <p className="text-sm text-slate-500">
        Course and blog content is managed from{' '}
        <Link href="/dashboard" className="underline">
          the dashboard
        </Link>
        , which lists everything on the platform for an admin.
      </p>
    </div>
  );
};

// Only the Admin role holds the stats and user permissions, so every request on this page comes back
// 403 for anyone else. The role check here is about not showing a screen made of error messages.
export default function AdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Admin</h1>

      <RequireAuth roles={['Admin']}>
        <Panels />
      </RequireAuth>
    </div>
  );
}
