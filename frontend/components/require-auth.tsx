'use client';

import Link from 'next/link';

import { hasRole, useAuth } from '@/lib/auth';
import type { RoleName } from '@/lib/types';
import { Empty } from './ui';

// The server decides what a role may read; this only decides what to put on the screen while it
// does. Children are not rendered until there is a user, which also keeps a page from firing a
// request that would come back 401 and bounce a visitor to the login screen.
export const RequireAuth = ({
  roles,
  children,
}: {
  roles?: RoleName[];
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-sm text-slate-500">Loading</p>;

  if (!user) {
    return (
      <Empty>
        <Link href="/login" className="text-slate-900 underline">
          Sign in
        </Link>{' '}
        to see this page.
      </Empty>
    );
  }

  if (roles && !hasRole(user, ...roles)) {
    return <Empty>This page is not for {user.role?.name} accounts.</Empty>;
  }

  return <>{children}</>;
};
