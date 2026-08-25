'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Markdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { BlogPost, Single } from '@/lib/types';
import { Alert, Empty } from '@/components/ui';

const Post = ({ documentId }: { documentId: string }) => {
  const post = useApi<Single<BlogPost>>(`/blog-posts/${documentId}`);

  if (post.loading) return <p className="text-sm text-slate-500">Loading post</p>;

  // A draft answers 404 to everyone outside the two roles that manage the blog, so an unpublished
  // post reads as not being there yet rather than as something being withheld.
  if (post.status === 404) return <Empty>This post is not published.</Empty>;

  if (post.error) return <Alert>{post.error}</Alert>;

  const detail = post.data?.data;

  if (!detail) return <Empty>This post is not available.</Empty>;

  return (
    <article className="space-y-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Blog
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{detail.title}</h1>

        <p className="mt-2 text-xs text-slate-500">
          {new Date(detail.createdAt).toLocaleDateString()}
          {detail.publishState === 'draft' && ' · draft'}
        </p>
      </div>

      <div className="prose prose-slate max-w-none">
        <Markdown>{detail.body}</Markdown>
      </div>
    </article>
  );
};

export default function BlogPostPage() {
  const params = useParams<{ documentId: string }>();

  return <Post documentId={params.documentId} />;
}
