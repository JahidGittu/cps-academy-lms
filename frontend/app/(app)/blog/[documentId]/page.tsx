'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Markdown from 'react-markdown';
import { ArrowLeft, Calendar, Edit3 } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Single } from '@/lib/types';
import { Alert, Empty } from '@/components/ui';

const Post = ({ documentId }: { documentId: string }) => {
  const { user } = useAuth();
  const post = useApi<Single<BlogPost>>(`/blog-posts/${documentId}`);

  if (post.loading) return <p className="text-sm text-slate-500">Loading article...</p>;

  if (post.status === 404) {
    return (
      <Empty>
        <p className="font-semibold text-slate-800">Post not found</p>
        <p className="mt-1 text-sm text-slate-500">
          This post either does not exist or has not been published yet.
        </p>
      </Empty>
    );
  }

  if (post.error) return <Alert>{post.error}</Alert>;

  const detail = post.data?.data;

  if (!detail) return <Empty>No content available.</Empty>;

  const canEdit = hasRole(user, 'Content Manager', 'Admin');

  return (
    <article className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Articles</span>
        </Link>

        {canEdit && (
          <Link
            href={`/blog/${documentId}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit3 className="size-3.5" />
            <span>Edit Article</span>
          </Link>
        )}
      </div>

      {detail.coverImageUrl && (
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={detail.coverImageUrl}
            alt={detail.title}
            className="h-64 sm:h-80 w-full object-cover"
          />
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-slate-400" />
            <span>{new Date(detail.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </span>

          {detail.publishState === 'draft' && (
            <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
              Draft Mode
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
          {detail.title}
        </h1>
      </div>

      <div className="prose prose-slate max-w-none rounded-xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-xs leading-relaxed text-slate-700">
        <Markdown>{detail.body}</Markdown>
      </div>
    </article>
  );
};

export default function BlogPostPage() {
  const params = useParams<{ documentId: string }>();

  return <Post documentId={params.documentId} />;
}
