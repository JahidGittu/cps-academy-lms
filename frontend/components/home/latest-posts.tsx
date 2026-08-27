'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { excerpt } from '@/lib/excerpt';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Collection } from '@/lib/types';
import { Card } from '@/components/ui';

const listQuery = '/blog-posts?sort=createdAt:desc&pagination[pageSize]=3';

export const LatestPosts = () => {
  const posts = useApi<Collection<BlogPost>>(listQuery);
  const rows = posts.data?.data ?? [];

  // Nothing published, or the API is down: either way there is no section worth a heading. The blog
  // has its own page in the header for anyone looking for it.
  if (posts.loading || posts.error || !rows.length) return null;

  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">From the blog</h2>
            <p className="mt-2 text-slate-600">Notes on what is being taught here and why.</p>
          </div>

          <Link
            href="/blog"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-600"
          >
            Read the blog
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {rows.map((post) => (
            <Link key={post.documentId} href={`/blog/${post.documentId}`} className="block">
              <Card hover className="h-full">
                <p className="text-xs text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>

                <h3 className="mt-2 font-medium">{post.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{excerpt(post.body)}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
