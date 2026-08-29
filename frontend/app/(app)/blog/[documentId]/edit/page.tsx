'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Card, Empty, LoadingState } from '@/components/ui';
import { PostForm } from '@/components/post-form';
import { ConfirmModal } from '@/components/confirm-modal';
import { useSetBreadcrumbs } from '@/components/dashboard-shell';

const Delete = ({ post }: { post: BlogPost }) => {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    setBusy(true);
    setError('');

    try {
      await api.delete(`/blog-posts/${post.documentId}`);
      router.push('/admin/blog-management');
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <Card className="border-red-500/30 bg-red-500/10">
        <h2 className="text-sm font-bold text-red-500">Delete this article</h2>
        <p className="mt-1 text-xs text-muted">
          Permanently delete this engineering blog post from the platform.
        </p>

        <div className="mt-4 space-y-3">
          <Alert>{error}</Alert>

          <Button variant="danger" disabled={busy} onClick={() => setShowModal(true)}>
            {busy ? 'Deleting...' : 'Delete post'}
          </Button>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showModal}
        title="Delete This Article?"
        message={`Are you sure you want to permanently delete "${post.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete Article"
        cancelText="Cancel"
        loading={busy}
        onConfirm={remove}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

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
          label="Save changes"
          save={async (values) => {
            await api.put(`/blog-posts/${documentId}`, { data: values });
            await post.reload();
          }}
        />
      </Card>

      <Delete post={detail} />
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
