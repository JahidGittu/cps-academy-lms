'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { hasRole, useAuth } from '@/lib/auth';
import type { RoleName } from '@/lib/types';
import { LoadingState } from './ui';

export const getRoleHomePath = (roleName?: string) => {
  if (roleName === 'Admin') return '/admin';
  if (roleName === 'Content Manager') return '/admin/course-management';
  if (roleName === 'Instructor') return '/dashboard';
  if (roleName === 'Student') return '/dashboard';
  return '/dashboard';
};

export const RequireAuth = ({
  roles,
  children,
}: {
  roles?: RoleName[];
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = !roles || (user ? hasRole(user, ...roles) : false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        const redirectTarget = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
        router.replace(`/login${redirectTarget}`);
      } else if (!isAuthorized) {
        // Automatically redirect unauthorized users directly to their role-specific workspace
        const target = getRoleHomePath(user.role?.name);
        router.replace(target);
      }
    }
  }, [user, loading, isAuthorized, pathname, router]);

  if (loading || !user || !isAuthorized) {
    return <LoadingState minHeight="min-h-[50vh]" />;
  }

  return <>{children}</>;
};
