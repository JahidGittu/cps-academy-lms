'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Plus, Search, Sparkles, Tag, ArrowRight } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';
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

export default function BlogPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All');

  const posts = useApi<Collection<BlogPost>>(listQuery);
  const rows = posts.data?.data ?? [];

  // Client-side search and topic filtering
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

  const featured = rows[0];
  const canManage = hasRole(user, 'Content Manager', 'Admin');

  return (
    <div className="space-y-10">
      {/* Blog Header & Search Banner */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 px-6 py-8 sm:px-10 sm:py-10 text-white border border-slate-800 shadow-md">
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
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
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
                className="w-full rounded-lg border border-slate-700 bg-slate-800/90 pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {canManage && (
              <Link
                href="/blog/new"
                className="brand-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 shrink-0"
              >
                <Plus className="size-4" />
                <span>Write Post</span>
              </Link>
            )}
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
            className={`rounded-md px-3.5 py-1 text-xs font-semibold transition-all ${
              activeTopic === topic
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Main Content & Sidebar Layout */}
      {posts.loading ? (
        <LoadingState
          message="Loading engineering articles..."
          subtext="Fetching technical write-ups, architecture breakdowns, and guides."
        />
      ) : posts.error ? (
        <Alert>{posts.error}</Alert>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
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
              filtered.map((post, idx) => {
                const cover = post.coverImageUrl || DEFAULT_POST_COVERS[idx % DEFAULT_POST_COVERS.length];
                return (
                  <Link key={post.documentId} href={`/blog/${post.documentId}`} className="block group">
                    <Card hover className="flex flex-col sm:flex-row gap-5 p-5">
                      <div className="sm:w-48 h-36 shrink-0 overflow-hidden rounded-lg bg-slate-900 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cover}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                              {post.title}
                            </h2>

                            {post.publishState === 'draft' && (
                              <span className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                                Draft
                              </span>
                            )}
                          </div>

                          <p className="mt-2 line-clamp-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {excerpt(post.body)}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="size-3.5 text-slate-400" />
                            <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </span>
                          <span className="font-semibold text-brand-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Read article</span>
                            <ArrowRight className="size-3.5" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="size-4 text-brand-600" />
                <span>About This Blog</span>
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Technical writeups and tutorials authored by CPS Academy content managers and instructors. 
                Drafts are isolated on the server and only visible to authorized roles.
              </p>
            </div>

            {featured && (
              <div className="rounded-xl border border-brand-200 brand-gradient-subtle p-5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block mb-1">
                  Featured Post
                </span>
                <Link href={`/blog/${featured.documentId}`} className="block group">
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                    {featured.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {excerpt(featured.body)}
                  </p>
                  <span className="mt-3 inline-block text-xs font-semibold text-brand-600">
                    Read article →
                  </span>
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
