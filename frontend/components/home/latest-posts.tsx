'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User, Newspaper } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import { excerpt } from '@/lib/excerpt';
import { resolveImageUrl } from '@/components/course-cover';
import type { Collection, BlogPost } from '@/lib/types';
import { Card } from '@/components/ui';

const listQuery =
  '/blog-posts?filters[publishState][$eq]=published&sort=createdAt:desc&pagination[pageSize]=3';

export const LatestPosts = () => {
  const posts = useApi<Collection<BlogPost>>(listQuery);
  const rows = useMemo(
    () => (posts.data?.data ?? []).filter((p) => p.publishState === 'published'),
    [posts.data]
  );

  if (posts.loading || posts.error || !rows.length) return null;

  return (
    <section className="border-b border-theme bg-subtle py-16 transition-colors duration-200">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              From the Blog
            </h2>
            <p className="mt-2 text-base text-secondary">
              Technical articles and guides written by instructors and students.
            </p>
          </div>

          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-lg border border-theme bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-2xs hover:bg-elevated hover:text-brand transition"
          >
            <span>All Articles</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((post) => {
            const date = new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const coverImage = post.coverImageUrl ? resolveImageUrl(post.coverImageUrl) : null;

            return (
              <Link key={post.documentId} href={`/blog/${post.documentId}`} className="group block">
                <Card className="h-full flex flex-col justify-between overflow-hidden border-theme bg-surface transition-all duration-200 group-hover:-translate-y-1 group-hover:border-active group-hover:shadow-xl p-0 rounded-xl shadow-md">
                  {/* Cover Image or Branded Card Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-canvas flex items-center justify-center">
                    {coverImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center brand-gradient p-6 text-center text-white/90">
                        <Newspaper className="size-8 mb-1.5 opacity-70" />
                        <span className="text-xs font-bold line-clamp-1 text-white">{post.title}</span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-muted mb-2.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {date}
                        </span>
                        {post.author?.username && (
                          <span className="flex items-center gap-1 font-medium text-primary">
                            <User className="size-3.5" />
                            {post.author.username}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-primary line-clamp-2 group-hover:text-brand transition-colors">
                        {post.title}
                      </h3>

                      <p className="mt-2 text-sm text-secondary line-clamp-3 leading-relaxed">
                        {excerpt(post.body)}
                      </p>
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand group-hover:underline">
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
