'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';
import type { RoleName } from '@/lib/types';
import { Button, LoadingState } from './ui';

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

  useEffect(() => {
    if (!loading && !user) {
      const redirectTarget = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${redirectTarget}`);
    }
  }, [user, loading, pathname, router]);

  if (loading || !user) {
    return <LoadingState minHeight="min-h-[50vh]" />;
  }

  if (roles && !hasRole(user, ...roles)) {
    const isStudent = user.role?.name === 'Student';
    const fallbackPath = isStudent ? '/dashboard' : '/admin';

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4 shadow-2xs">
          <ShieldAlert className="size-7" />
        </div>
        <h2 className="text-xl font-bold text-primary">Access Restricted</h2>
        <p className="mt-1.5 max-w-md text-xs sm:text-sm text-muted leading-relaxed">
          Your account role (<strong className="text-primary">{user.role?.name ?? 'Authenticated'}</strong>) does not have sufficient administrative privileges to access this area.
        </p>
        <div className="mt-6">
          <Link href={fallbackPath}>
            <Button variant="primary" className="gap-2">
              <ArrowLeft className="size-4" />
              <span>Return to Workspace</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
