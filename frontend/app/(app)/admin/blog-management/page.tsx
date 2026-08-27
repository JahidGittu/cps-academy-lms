'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  FileEdit,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { excerpt } from '@/lib/excerpt';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Collection } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Empty, LoadingState } from '@/components/ui';

const listQuery = '/blog-posts?sort=createdAt:desc';
const TOPICS = ['All', 'Architecture', 'Security', 'Tutorial', 'Database'];

const DEFAULT_POST_COVERS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80',
];

const BlogManagementStudio = () => {
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const posts = useApi<Collection<BlogPost>>(listQuery);
  const rows = posts.data?.data ?? [];

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
        message="Loading blog studio..."
        subtext="Fetching publication drafts and published engineering articles."
      />
    );
  }

  if (posts.error) return <Alert>{posts.error}</Alert>;

  return (
    <div className="space-y-6">
      {/* Top Header & New Post Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Blog Management Studio
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Author, edit, publish, and manage drafts and live technical articles across the platform.
          </p>
        </div>

        <Link
          href="/blog/new"
          className="brand-gradient inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Write New Post</span>
        </Link>
      </div>

      <Alert>{actionError}</Alert>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
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

      {/* Blog Management Data Table */}
      {filtered.length === 0 ? (
        <Empty>
          <p className="font-semibold text-slate-700">No articles found matching your criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or status filter.</p>
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
      ) : (
        <div className="overflow-hidden rounded-md border border-slate-200/90 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Article Title</th>
                  <th className="px-5 py-3.5">Author</th>
                  <th className="px-5 py-3.5">Publication Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((post, idx) => {
                  const isPublished = post.publishState === 'published';
                  const cover = post.coverImageUrl || DEFAULT_POST_COVERS[idx % DEFAULT_POST_COVERS.length];

                  return (
                    <tr key={post.documentId} className="hover:bg-slate-50/60 transition-colors">
                      {/* Cover & Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
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
                      <td className="px-5 py-3.5 font-medium text-slate-600 text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                            {(post.author?.username || 'Staff').slice(0, 2)}
                          </span>
                          <span className="truncate">{post.author?.username || 'Staff Editor'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="size-3" />
                            <span>Published</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
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
                            title="Preview Public Article"
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
      )}
    </div>
  );
};

export default function BlogManagementPage() {
  return (
    <RequireAuth roles={['Admin', 'Content Manager']}>
      <BlogManagementStudio />
    </RequireAuth>
  );
}
