'use client';

import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import type { BlogPost, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { PostForm } from '@/components/post-form';
import { Card } from '@/components/ui';
import { useSetBreadcrumbs } from '@/components/dashboard-shell';

const Create = () => {
  const router = useRouter();

  return (
    <Card>
      <PostForm
        save={async (values) => {
          const res = await api.post<Single<BlogPost>>('/blog-posts', { data: values });
          const docId = res.data?.data?.documentId;
          if (docId) {
            router.push(`/admin/blog-management/${docId}/edit`);
          } else {
            router.push('/admin/blog-management');
          }
        }}
      />
    </Card>
  );
};

export default function NewPostPage() {
  useSetBreadcrumbs([
    { label: 'Blogs', href: '/admin/blog-management' },
    { label: 'New Article' },
  ]);

  return (
    <RequireAuth roles={['Content Manager', 'Admin']}>
      <Create />
    </RequireAuth>
  );
}
