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
        label="Publish Article"
        save={async (values) => {
          // The byline is not in the body: the controller takes the author from the session
          await api.post<Single<BlogPost>>('/blog-posts', { data: values });
          router.push('/admin/blog-management');
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
