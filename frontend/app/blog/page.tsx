'use client';

import Link from 'next/link';

import { useApi } from '@/lib/use-api';
import type { BlogPost, Collection } from '@/lib/types';
import { Alert, Card, Empty } from '@/components/ui';

// The list is public, so no sign in wrapper. Whether drafts come back is the server's decision, not
// a filter sent from here: the blog-post controller pins anyone outside the two managing roles to
// published, including a visitor with no account at all.
const listQuery = '/blog-posts?sort=createdAt:desc';

// The body is Markdown, so the first ordinary line of prose stands in for a summary. Headings are
// skipped because "## Introduction" tells a reader nothing about the post.
const excerpt = (body: string) =>
  body
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#')) ?? '';

const Posts = () => {
  const posts = useApi<Collection<BlogPost>>(listQuery);

  if (posts.loading) return <p className="text-sm text-slate-500">Loading posts</p>;

  if (posts.error) return <Alert>{posts.error}</Alert>;

  const rows = posts.data?.data ?? [];

  if (!rows.length) return <Empty>Nothing published yet.</Empty>;

  return (
    <div className="space-y-4">
      {rows.map((post) => (
        <Link key={post.documentId} href={`/blog/${post.documentId}`} className="block">
          <Card className="hover:border-slate-400">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-medium">{post.title}</h2>

              {post.publishState === 'draft' && (
                <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                  Draft
                </span>
              )}
            </div>

            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{excerpt(post.body)}</p>

            <p className="mt-3 text-xs text-slate-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default function BlogPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Blog</h1>

      <Posts />
    </div>
  );
}
