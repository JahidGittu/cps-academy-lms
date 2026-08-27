'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';

import { excerpt } from '@/lib/excerpt';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Collection } from '@/lib/types';
import { Card } from '@/components/ui';

const listQuery = '/blog-posts?sort=createdAt:desc&pagination[pageSize]=3';

const DEFAULT_POST_COVERS = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
];

export const LatestPosts = () => {
  const posts = useApi<Collection<BlogPost>>(listQuery);
  const rows = posts.data?.data ?? [];

  if (posts.loading || posts.error || !rows.length) return null;

  return (
    <section className="border-b border-slate-200/80 bg-slate-50/50 py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1 text-xs font-semibold text-brand-700 mb-2">
              Engineering Insights
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From the Blog
            </h2>
            <p className="mt-2 text-slate-600 text-base">
              Articles and technical guides on software development and database design.
            </p>
          </div>

          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-brand-600 transition"
          >
            <span>Explore All Posts</span>
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((post, idx) => {
            const cover = post.coverImageUrl || DEFAULT_POST_COVERS[idx % DEFAULT_POST_COVERS.length];
            return (
              <Link key={post.documentId} href={`/blog/${post.documentId}`} className="block h-full group">
                <Card hover className="h-full flex flex-col justify-between overflow-hidden p-0">
                  <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
                        <Calendar className="size-3.5" />
                        <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-slate-600 leading-relaxed">
                        {excerpt(post.body)}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                      <span>Read article</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
