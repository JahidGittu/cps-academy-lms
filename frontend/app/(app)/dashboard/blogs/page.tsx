'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardBlogsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/blog-management');
  }, [router]);

  return null;
}
