'use client';

import Link from 'next/link';

import { hasRole, useAuth } from '@/lib/auth';
import type { RoleName } from '@/lib/types';
import { Empty, LoadingState } from './ui';

export const RequireAuth = ({
  roles,
  children,
}: {
  roles?: RoleName[];
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LoadingState
        message="Authenticating session..."
        subtext="Verifying account security and permission level."
      />
    );
  }

  if (!user) {
    return (
      <Empty>
        <Link href="/login" className="text-brand-600 font-bold underline hover:text-brand-800">
          Sign in
        </Link>{' '}
        to access this page.
      </Empty>
    );
  }

  if (roles && !hasRole(user, ...roles)) {
    return (
      <Empty>
        <p className="font-bold text-slate-800">Access Restricted</p>
        <p className="mt-1 text-xs text-slate-500">This workspace is not accessible to {user.role?.name ?? 'your'} accounts.</p>
      </Empty>
    );
  }

  return <>{children}</>;
};
