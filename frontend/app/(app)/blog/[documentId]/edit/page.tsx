'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Empty } from '@/components/ui';
import { PostForm } from '@/components/post-form';

const Delete = ({ post }: { post: BlogPost }) => {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    if (!window.confirm(`Delete ${post.title}?`)) return;

    setBusy(true);
    setError('');

    try {
      await api.delete(`/blog-posts/${post.documentId}`);
      router.push('/blog');
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-slate-200 pt-6">
      <Alert>{error}</Alert>

      <Button variant="danger" disabled={busy} onClick={remove}>
        Delete post
      </Button>
    </div>
  );
};

const Edit = ({ documentId }: { documentId: string }) => {
  const post = useApi<Single<BlogPost>>(`/blog-posts/${documentId}`);

  if (post.loading) return <p className="text-sm text-slate-500">Loading post</p>;

  if (post.error) return <Alert>{post.error}</Alert>;

  const detail = post.data?.data;

  if (!detail) return <Empty>This post does not exist.</Empty>;

  return (
    <div className="space-y-6">
      <Link
        href={`/blog/${documentId}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        {detail.title}
      </Link>

      <PostForm
        post={detail}
        label="Save changes"
        save={async (values) => {
          await api.put(`/blog-posts/${documentId}`, { data: values });
          await post.reload();
        }}
      />

      <Delete post={detail} />
    </div>
  );
};

export default function EditPostPage() {
  const params = useParams<{ documentId: string }>();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit post</h1>

      {/* Every post on the blog is the blog team's to edit, so there is no per author check here the
          way courses have one. The two roles in the matrix are the whole of it. */}
      <RequireAuth roles={['Content Manager', 'Admin']}>
        <Edit documentId={params.documentId} />
      </RequireAuth>
    </div>
  );
}
