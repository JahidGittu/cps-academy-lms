'use client';

import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isDashboardRoute) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>;
}
