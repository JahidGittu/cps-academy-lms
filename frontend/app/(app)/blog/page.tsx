'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Plus,
  Search,
  Sparkles,
  Tag,
  ArrowRight,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  FileEdit,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { excerpt } from '@/lib/excerpt';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Collection } from '@/lib/types';
import { Alert, Button, Card, Empty, LoadingState } from '@/components/ui';

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const posts = useApi<Collection<BlogPost>>(listQuery);
  const rows = posts.data?.data ?? [];

  const canManage = hasRole(user, 'Content Manager', 'Admin');

  // Filter by query, topic, and draft/published status
  const filtered = useMemo(() => {
    return rows.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.body.toLowerCase().includes(query.toLowerCase());

      const matchesTopic =
        activeTopic === 'All' ||
        post.title.toLowerCase().includes(activeTopic.toLowerCase()) ||
        post.body.toLowerCase().includes(activeTopic.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && post.publishState === 'published') ||
        (statusFilter === 'draft' && post.publishState === 'draft');

      return matchesSearch && matchesTopic && matchesStatus;
    });
  }, [rows, query, activeTopic, statusFilter]);

  const publishedCount = rows.filter((r) => r.publishState === 'published').length;
  const draftCount = rows.filter((r) => r.publishState === 'draft').length;

  const handleDelete = async (documentId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    setDeletingId(documentId);
    setActionError('');

    try {
      await api.delete(`/blog-posts/${documentId}`);
      await posts.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (posts.loading) {
    return (
      <LoadingState
        message="Loading engineering articles..."
        subtext="Fetching publication feed, drafts, and technical guides."
      />
    );
  }

  if (posts.error) return <Alert>{posts.error}</Alert>;

  return (
    <div className="space-y-8">
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {canManage ? 'Blog Management Studio' : 'Engineering Blog & Guides'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {canManage
              ? 'Author, publish, edit, and manage drafts and live technical articles across the platform.'
              : 'In-depth writeups on architecture, backend access control, and software engineering.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canManage && (
            <div className="flex items-center rounded-md border border-slate-200 bg-slate-100 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <TableIcon className="size-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Reader Card View"
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Reader View</span>
              </button>
            </div>
          )}

          {canManage && (
            <Link
              href="/blog/new"
              className="brand-gradient inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Write New Post</span>
            </Link>
          )}
        </div>
      </div>

      <Alert>{actionError}</Alert>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status / Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs mr-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`rounded px-3 py-1 text-xs font-bold transition ${
                  statusFilter === 'all' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All ({rows.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('published')}
                className={`rounded px-3 py-1 text-xs font-bold transition ${
                  statusFilter === 'published' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Published ({publishedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('draft')}
                className={`rounded px-3 py-1 text-xs font-bold transition ${
                  statusFilter === 'draft' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Drafts ({draftCount})
              </button>
            </div>
          )}

          {TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setActiveTopic(topic)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                activeTopic === topic
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-2xs"
          />
        </div>
      </div>

      {/* 3. Empty State */}
      {filtered.length === 0 ? (
        <Empty>
          <p className="font-semibold text-slate-700">No articles found matching your criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search keywords.</p>
          {(query || activeTopic !== 'All' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveTopic('All');
                setStatusFilter('all');
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline cursor-pointer"
            >
              Clear All Filters ✕
            </button>
          )}
        </Empty>
      ) : canManage && viewMode === 'table' ? (
        /* 4. Blog Management Studio Table */
        <div className="overflow-hidden rounded-md border border-slate-200/90 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Article Title</th>
                  <th className="px-5 py-3.5">Author</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((post, idx) => {
                  const isPublished = post.publishState === 'published';
                  const cover = post.coverImageUrl || DEFAULT_POST_COVERS[idx % DEFAULT_POST_COVERS.length];

                  return (
                    <tr key={post.documentId} className="hover:bg-slate-50/60 transition-colors">
                      {/* Title & Thumbnail */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cover}
                              alt={post.title}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-md">
                            <Link
                              href={`/blog/${post.documentId}`}
                              className="font-bold text-slate-900 hover:text-brand-600 transition block truncate"
                            >
                              {post.title}
                            </Link>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {excerpt(post.body)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                            {(post.author?.username || 'Admin').slice(0, 2)}
                          </span>
                          <span className="truncate">{post.author?.username || 'Staff Editor'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="size-3" />
                            <span>Published</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                            <FileEdit className="size-3" />
                            <span>Draft</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/blog/${post.documentId}`}
                            title="Preview Article"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <Link
                            href={`/blog/${post.documentId}/edit`}
                            title="Edit Article"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(post.documentId, post.title)}
                            disabled={deletingId === post.documentId}
                            title="Delete Article"
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 5. Reader Cards Feed (For Public Visitors, Students, or Reader View Mode) */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, idx) => {
            const isPublished = post.publishState === 'published';
            const cover = post.coverImageUrl || DEFAULT_POST_COVERS[idx % DEFAULT_POST_COVERS.length];

            return (
              <Link key={post.documentId} href={`/blog/${post.documentId}`} className="block group">
                <Card hover className="flex flex-col h-full overflow-hidden p-0">
                  <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt={post.title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {!isPublished && (
                      <span className="absolute top-3 right-3 rounded bg-amber-500/90 text-white px-2 py-0.5 text-[11px] font-bold shadow backdrop-blur-xs">
                        Draft
                      </span>
                    )}
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
