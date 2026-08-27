'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import { excerpt } from '@/lib/excerpt';
import type { Collection, BlogPost } from '@/lib/types';
import { Card } from '@/components/ui';

const listQuery = '/blog-posts?sort=createdAt:desc&pagination[pageSize]=3';

// Distinct editorial & software writing cover imagery (different from course infrastructure covers)
const blogCovers = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80',
];

export const LatestPosts = () => {
  const posts = useApi<Collection<BlogPost>>(listQuery);
  const rows = posts.data?.data ?? [];

  if (posts.loading || posts.error || !rows.length) return null;

  return (
    <section className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block rounded bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-semibold text-brand-700 mb-2">
              Engineering Insights
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              From the Blog
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Technical articles and guides written by instructors and students.
            </p>
          </div>

          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-brand-600 transition"
          >
            <span>All Articles</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((post, idx) => {
            const date = new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const coverImage = post.coverImageUrl ?? blogCovers[idx % blogCovers.length];

            return (
              <Link key={post.documentId} href={`/blog/${post.documentId}`} className="group block">
                <Card className="h-full flex flex-col justify-between overflow-hidden border-slate-200/90 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand-300 group-hover:shadow-sm p-0 rounded-md">
                  {/* High-res Editorial Cover Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {date}
                        </span>
                        {post.author?.username && (
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <User className="size-3.5" />
                            {post.author.username}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {post.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {excerpt(post.body)}
                      </p>
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 group-hover:text-brand-700">
                      Read article <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
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
