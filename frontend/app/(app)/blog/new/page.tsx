'use client';

import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import type { BlogPost, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { PostForm } from '@/components/post-form';

const Create = () => {
  const router = useRouter();

  return (
    <PostForm
      label="Create post"
      save={async (values) => {
        // The byline is not in the body: the controller takes the author from the session, the same
        // way a course takes its owner.
        const { data } = await api.post<Single<BlogPost>>('/blog-posts', { data: values });

        router.push(`/blog/${data.data.documentId}`);
      }}
    />
  );
};

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New post</h1>

      <RequireAuth roles={['Content Manager', 'Admin']}>
        <Create />
      </RequireAuth>
    </div>
  );
}
