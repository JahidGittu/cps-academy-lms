'use client';

import { useParams } from 'next/navigation';

import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Card, Empty, LoadingState } from '@/components/ui';
import { PostForm } from '@/components/post-form';
import { useSetBreadcrumbs } from '@/components/dashboard-shell';

const Edit = ({ documentId }: { documentId: string }) => {
  const post = useApi<Single<BlogPost>>(`/blog-posts/${documentId}`);
  const detail = post.data?.data;

  useSetBreadcrumbs(
    detail
      ? [
          { label: 'Blogs', href: '/admin/blog-management' },
          { label: detail.title },
        ]
      : [{ label: 'Blogs', href: '/admin/blog-management' }, { label: 'Edit Article' }]
  );

  if (post.loading && !post.data) return <LoadingState />;

  if (post.error) return <Alert>{post.error}</Alert>;

  if (!detail) return <Empty>This post does not exist.</Empty>;

  return (
    <div className="space-y-6">
      <Card>
        <PostForm
          post={detail}
          save={async (values) => {
            await api.put(`/blog-posts/${documentId}`, { data: values });
            await post.reload();
          }}
        />
      </Card>
    </div>
  );
};

export default function EditPostPage() {
  const params = useParams<{ documentId: string }>();

  return (
    <RequireAuth roles={['Content Manager', 'Admin']}>
      <Edit documentId={params.documentId} />
    </RequireAuth>
  );
}
