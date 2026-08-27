'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Search, Sparkles, Tag, ArrowRight } from 'lucide-react';

import { excerpt } from '@/lib/excerpt';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Collection } from '@/lib/types';
import { Alert, Card, Empty, LoadingState } from '@/components/ui';

const listQuery = '/blog-posts?sort=createdAt:desc';
const TOPICS = ['All', 'Architecture', 'Security', 'Tutorial', 'Database'];

const DEFAULT_POST_COVERS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80',
];

export default function PublicBlogPage() {
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All');

  const posts = useApi<Collection<BlogPost>>(listQuery);
  const rows = posts.data?.data ?? [];

  // Filter by query and topic
  const filtered = useMemo(() => {
    return rows.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.body.toLowerCase().includes(query.toLowerCase());

      const matchesTopic =
        activeTopic === 'All' ||
        post.title.toLowerCase().includes(activeTopic.toLowerCase()) ||
        post.body.toLowerCase().includes(activeTopic.toLowerCase());

      return matchesSearch && matchesTopic;
    });
  }, [rows, query, activeTopic]);

  const featured = filtered[0];

  if (posts.loading) {
    return (
      <LoadingState
        message="Loading engineering articles..."
        subtext="Fetching technical write-ups, architecture breakdowns, and guides."
      />
    );
  }

  if (posts.error) return <Alert>{posts.error}</Alert>;

  return (
    <div className="space-y-10">
      {/* Blog Hero Header & Search Banner */}
      <div className="relative overflow-hidden rounded-md bg-slate-900 px-6 py-8 sm:px-10 sm:py-10 text-white border border-slate-800 shadow-md">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-16 size-64 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300 backdrop-blur mb-3">
            <Sparkles className="size-3.5" />
            <span>Articles & Insights</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Engineering Blog & Guides
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            In-depth writeups on architecture, backend access control, and software engineering.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-800/90 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Topics / Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4">
        <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
          <Tag className="size-3.5" /> Filter by:
        </span>
        {TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => setActiveTopic(topic)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              activeTopic === topic
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Articles Feed */}
      {filtered.length === 0 ? (
        <Empty>
          <p className="font-semibold text-slate-700">No matching articles found</p>
          <p className="text-xs text-slate-500 mt-1">Try searching for a different keyword or topic.</p>
          {(query || activeTopic !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveTopic('All');
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline cursor-pointer"
            >
              Clear All Filters ✕
            </button>
          )}
        </Empty>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, idx) => {
            const cover = post.coverImageUrl || DEFAULT_POST_COVERS[idx % DEFAULT_POST_COVERS.length];

            return (
              <Link key={post.documentId} href={`/blog/${post.documentId}`} className="block group">
                <Card hover className="flex flex-col h-full overflow-hidden p-0 rounded-md border-slate-200/90 shadow-2xs">
                  <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt={post.title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                        <Calendar className="size-3" />
                        <span>
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <h2 className="font-bold text-slate-900 group-hover:text-brand-600 transition line-clamp-2 text-base">
                        {post.title}
                      </h2>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {excerpt(post.body)}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                      <span>Read Full Article</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
