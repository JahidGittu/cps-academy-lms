'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Edit3, User, Clock } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Single } from '@/lib/types';
import { Alert, Empty, LoadingState } from '@/components/ui';
import { RichContent } from '@/components/rich-content';

const DEFAULT_POST_COVERS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80',
];

const getBlogCover = (documentId: string, customUrl?: string | null) => {
  if (customUrl) return customUrl;
  let hash = 0;
  for (let i = 0; i < documentId.length; i++) {
    hash = (hash + documentId.charCodeAt(i)) % DEFAULT_POST_COVERS.length;
  }
  return DEFAULT_POST_COVERS[hash];
};

const Post = ({ documentId }: { documentId: string }) => {
  const { user } = useAuth();
  const post = useApi<Single<BlogPost>>(`/blog-posts/${documentId}`);

  if (post.loading) {
    return <LoadingState />;
  }

  if (post.status === 404) {
    return (
      <Empty>
        <p className="font-semibold text-primary">Post not found</p>
        <p className="mt-1 text-sm text-muted">
          This post either does not exist or has not been published yet.
        </p>
      </Empty>
    );
  }

  if (post.error) return <Alert>{post.error}</Alert>;

  const detail = post.data?.data;

  if (!detail) return <Empty>No content available.</Empty>;

  const canEdit = hasRole(user, 'Content Manager', 'Admin');
  const coverImage = getBlogCover(detail.documentId, detail.coverImageUrl);

  return (
    <article className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-subtle">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand transition"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Articles</span>
        </Link>

        {canEdit && (
          <Link
            href={`/blog/${documentId}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-theme bg-surface px-3 py-1.5 text-xs font-semibold text-primary hover:bg-elevated transition shadow-2xs"
          >
            <Edit3 className="size-3.5" />
            <span>Edit Article</span>
          </Link>
        )}
      </div>

      {/* High-res Blog Cover Image Banner */}
      <div className="overflow-hidden rounded-lg border border-theme shadow-sm bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt={detail.title}
          className="h-64 sm:h-80 md:h-96 w-full object-cover"
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-medium mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted" />
            <span>
              {new Date(detail.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </span>

          {detail.author?.username && (
            <span className="flex items-center gap-1.5 text-primary font-semibold">
              <User className="size-3.5 text-muted" />
              <span>{detail.author.username}</span>
            </span>
          )}

          <span className="flex items-center gap-1 text-muted">
            <Clock className="size-3.5" />
            <span>3 min read</span>
          </span>

          {detail.topic && (
            <span className="rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 text-xs font-bold">
              {detail.topic}
            </span>
          )}

          {detail.publishState === 'draft' && (
            <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-[#e3b341] border border-amber-500/30">
              Draft Mode
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight leading-tight">
          {detail.title}
        </h1>
      </div>

      <div className="rounded-lg bg-surface p-6 sm:p-10 border border-theme shadow-xs leading-relaxed text-secondary">
        <RichContent content={detail.body} />
      </div>
    </article>
  );
};

export default function BlogPostPage() {
  const params = useParams<{ documentId: string }>();

  return <Post documentId={params.documentId} />;
}
