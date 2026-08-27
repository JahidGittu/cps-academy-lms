'use client';

import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isDashboardRoute) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-10">{children}</div>;
}
