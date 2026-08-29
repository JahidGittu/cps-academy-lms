'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Search, Sparkles, Tag, ArrowRight, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

import { excerpt } from '@/lib/excerpt';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Collection } from '@/lib/types';
import { Alert, Card, Empty, LoadingState } from '@/components/ui';

const listQuery = '/blog-posts?sort=createdAt:desc';
const TOPICS = ['All', 'Architecture', 'Security', 'Tutorial', 'Database', 'DevOps'];

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

  // Dynamic count calculation for each topic
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = { All: rows.length };
    TOPICS.forEach((t) => {
      if (t === 'All') return;
      counts[t] = rows.filter((p) => {
        const tags = (p.topic || '').toLowerCase();
        return (
          tags.includes(t.toLowerCase()) ||
          p.title.toLowerCase().includes(t.toLowerCase()) ||
          p.body.toLowerCase().includes(t.toLowerCase())
        );
      }).length;
    });
    return counts;
  }, [rows]);

  // Filter by query and topic
  const filtered = useMemo(() => {
    return rows.filter((post) => {
      const matchesSearch =
        query.trim() === '' ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.body.toLowerCase().includes(query.toLowerCase()) ||
        (post.topic || '').toLowerCase().includes(query.toLowerCase());

      const tags = (post.topic || '').toLowerCase();
      const matchesTopic =
        activeTopic === 'All' ||
        tags.includes(activeTopic.toLowerCase()) ||
        post.title.toLowerCase().includes(activeTopic.toLowerCase()) ||
        post.body.toLowerCase().includes(activeTopic.toLowerCase());

      return matchesSearch && matchesTopic;
    });
  }, [rows, query, activeTopic]);

  if (posts.loading) {
    return <LoadingState />;
  }

  if (posts.error) return <Alert>{posts.error}</Alert>;

  return (
    <div className="space-y-8">
      {/* Blog Hero Header & Search Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface border border-theme px-6 py-8 sm:px-10 sm:py-10 shadow-md">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-16 size-64 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-brand-subtle border border-brand-border px-3 py-1 text-xs font-semibold text-brand backdrop-blur mb-3">
            <Sparkles className="size-3.5" />
            <span>Articles & Insights</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            Engineering Blog & Guides
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-secondary leading-relaxed">
            In-depth writeups on architecture, backend access control, and software engineering.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
              <input
                type="text"
                placeholder="Search articles by title, topic, or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-theme bg-canvas pl-10 pr-4 py-2 text-xs sm:text-sm text-primary placeholder:text-muted outline-none transition focus:border-active focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Articles Feed (Left 8 cols) vs Tag & Highlights Sidebar (Right 4 cols) */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Articles List (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Active Filter Indicator */}
          <div className="flex items-center justify-between text-xs text-muted font-medium border-b border-subtle pb-3">
            <span>
              Showing <strong>{filtered.length}</strong> of {rows.length} engineering articles
              {activeTopic !== 'All' && ` in #${activeTopic}`}
            </span>

            {(activeTopic !== 'All' || query) && (
              <button
                type="button"
                onClick={() => {
                  setActiveTopic('All');
                  setQuery('');
                }}
                className="font-bold text-sky-400 hover:text-sky-300 transition cursor-pointer"
              >
                Reset Filters ✕
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <Empty>
              <p className="font-semibold text-primary">No matching articles found</p>
              <p className="text-xs text-muted mt-1">Try searching for a different keyword or topic.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setActiveTopic('All');
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </Empty>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((post, idx) => {
                const cover = post.coverImageUrl || DEFAULT_POST_COVERS[idx % DEFAULT_POST_COVERS.length];

                return (
                  <Link key={post.documentId} href={`/blog/${post.documentId}`} className="block group">
                    <Card hover className="flex flex-col h-full overflow-hidden p-0 rounded-xl border-theme shadow-2xs">
                      {/* Image Banner with Multi-Tag Badges */}
                      <div className="h-44 w-full overflow-hidden bg-canvas relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cover}
                          alt={post.title}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {post.topic && (
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[85%]">
                            {post.topic
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((t) => (
                                <span
                                  key={t}
                                  className="rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white border border-white/20 shadow-xs"
                                >
                                  {t}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-muted">
                            <Calendar className="size-3" />
                            <span>
                              {new Date(post.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <h2 className="font-bold text-primary group-hover:text-brand transition line-clamp-2 text-base leading-snug">
                            {post.title}
                          </h2>

                          <p className="text-xs text-secondary line-clamp-3 leading-relaxed">
                            {excerpt(post.body, 110)}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-subtle flex items-center justify-between text-xs font-semibold text-brand">
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

        {/* Right Column: Professional Topic Categories & Highlights Sidebar (4 cols) */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Topic Cloud Widget */}
          <div className="rounded-xl border border-theme bg-surface p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <Tag className="size-4 text-sky-400" />
              <span>Explore by Topics</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => {
                const isSelected = activeTopic === topic;
                const count = topicCounts[topic] ?? 0;

                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setActiveTopic(topic)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-600 dark:bg-sky-500 text-white shadow-xs border border-sky-600 dark:border-sky-500'
                        : 'bg-canvas text-secondary border border-theme hover:bg-elevated hover:text-primary'
                    }`}
                  >
                    <span>{topic}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-elevated text-muted'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured / Recent Articles Highlight */}
          <div className="rounded-xl border border-theme bg-surface p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <BookOpen className="size-4 text-sky-400" />
              <span>Recent Technical Reads</span>
            </h3>

            <div className="space-y-3 divide-y divide-subtle">
              {rows.slice(0, 4).map((post, idx) => (
                <Link
                  key={post.documentId}
                  href={`/blog/${post.documentId}`}
                  className="block pt-3 first:pt-0 group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-[10px] font-bold text-sky-400 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-primary group-hover:text-sky-400 transition line-clamp-2">
                        {post.title}
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
