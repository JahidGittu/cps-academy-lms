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
  RotateCcw,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { excerpt } from '@/lib/excerpt';
import { useApi } from '@/lib/use-api';
import type { BlogPost, Collection } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Empty } from '@/components/ui';
import { BlogManagementSkeleton } from '@/components/page-skeletons';
import { ConfirmModal } from '@/components/confirm-modal';

const TOPICS = ['All Topics', 'Architecture', 'Security', 'Tutorial', 'Database'];

const DEFAULT_POST_COVERS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80',
];

type BlogSortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

const BlogManagement = () => {
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All Topics');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<BlogSortOption>('newest');

  const [deletingPost, setDeletingPost] = useState<{ id: string; title: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const posts = useApi<Collection<BlogPost>>('/blog-posts?populate=*&sort=createdAt:desc');
  const rows = posts.data?.data ?? [];

  const publishedCount = useMemo(() => rows.filter((r) => r.publishState === 'published').length, [rows]);
  const draftCount = useMemo(() => rows.filter((r) => r.publishState === 'draft').length, [rows]);

  const filtered = useMemo(() => {
    return rows
      .filter((post) => {
        const matchesSearch =
          query.trim() === '' ||
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.body.toLowerCase().includes(query.toLowerCase()) ||
          (post.author?.username ?? '').toLowerCase().includes(query.toLowerCase());

        const matchesTopic =
          activeTopic === 'All Topics' ||
          post.title.toLowerCase().includes(activeTopic.toLowerCase()) ||
          post.body.toLowerCase().includes(activeTopic.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'published' && post.publishState === 'published') ||
          (statusFilter === 'draft' && post.publishState === 'draft');

        return matchesSearch && matchesTopic && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
        if (sortBy === 'title_desc') return b.title.localeCompare(a.title);
        if (sortBy === 'oldest') {
          return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
        }
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      });
  }, [rows, query, activeTopic, statusFilter, sortBy]);

  const hasActiveFilters = query !== '' || activeTopic !== 'All Topics' || statusFilter !== 'all';

  const resetFilters = () => {
    setQuery('');
    setActiveTopic('All Topics');
    setStatusFilter('all');
    setSortBy('newest');
  };

  const confirmDelete = async () => {
    if (!deletingPost) return;

    setBusy(true);
    setActionError('');

    try {
      await api.delete(`/blog-posts/${deletingPost.id}`);
      setDeletingPost(null);
      await posts.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (posts.loading) {
    return <BlogManagementSkeleton />;
  }

  if (posts.error) return <Alert>{posts.error}</Alert>;

  return (
    <div className="space-y-6">
      {/* Top Header & New Post Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
            Blogs
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Author, edit, publish, and manage drafts and live technical articles across the platform.
          </p>
        </div>

        <Link
          href="/blog/new"
          className="brand-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Write New Post</span>
        </Link>
      </div>

      <Alert>{actionError}</Alert>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-theme bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted">Total Articles</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-theme bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted">Published</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-500">{publishedCount}</p>
        </div>
        <div className="rounded-xl border border-theme bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted">Drafts</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-500">{draftCount}</p>
        </div>
        <div className="rounded-xl border border-theme bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted">Topics Covered</p>
          <p className="mt-1 text-2xl font-extrabold text-brand">
            {TOPICS.length - 1}
          </p>
        </div>
      </div>

      {/* Search, Filter & Sort Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-theme shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            placeholder="Search articles by title, content, or author..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg border border-theme bg-canvas text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-active transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="rounded-lg border border-theme bg-surface px-2.5 py-1.5 text-xs font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-active"
          >
            <option value="all">All Status ({rows.length})</option>
            <option value="published">Published ({publishedCount})</option>
            <option value="draft">Drafts ({draftCount})</option>
          </select>

          {/* Topic Filter */}
          <select
            value={activeTopic}
            onChange={(e) => setActiveTopic(e.target.value)}
            className="rounded-lg border border-theme bg-surface px-2.5 py-1.5 text-xs font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-active"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as BlogSortOption)}
            className="rounded-lg border border-theme bg-surface px-2.5 py-1.5 text-xs font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-active"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title_asc">Title (A - Z)</option>
            <option value="title_desc">Title (Z - A)</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-theme bg-elevated px-2.5 py-1.5 text-xs font-bold text-secondary hover:text-primary transition"
              title="Reset all filters"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-muted font-medium px-1">
        <span>
          Showing <strong>{filtered.length}</strong> of {rows.length} articles
        </span>
      </div>

      {/* Blog Management Data Table */}
      {filtered.length === 0 ? (
        <Empty>
          <p className="text-base font-bold text-primary">
            {hasActiveFilters ? 'No articles found matching your criteria' : 'No articles created yet'}
          </p>
          <p className="text-xs text-muted mt-1">
            {hasActiveFilters
              ? 'Try changing your search keywords or resetting the status and topic filters.'
              : 'Write your first technical article and publish it to the engineering blog.'}
          </p>
          {hasActiveFilters ? (
            <Button variant="plain" onClick={resetFilters} className="mt-4">
              Clear All Filters
            </Button>
          ) : (
            <Link
              href="/blog/new"
              className="brand-gradient mt-4 inline-flex items-center gap-2 rounded px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95"
            >
              <Plus className="size-4" />
              <span>Write First Article</span>
            </Link>
          )}
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-subtle bg-canvas text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3.5">Article Title</th>
                  <th className="px-5 py-3.5">Author</th>
                  <th className="px-5 py-3.5">Publication Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-subtle">
                {filtered.map((post, idx) => {
                  const isPublished = post.publishState === 'published';
                  const cover = post.coverImageUrl || DEFAULT_POST_COVERS[idx % DEFAULT_POST_COVERS.length];

                  return (
                    <tr key={post.documentId} className="hover:bg-elevated/50 transition-colors">
                      {/* Cover & Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <div className="size-12 rounded-lg overflow-hidden bg-canvas shrink-0 border border-theme shadow-2xs">
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
                              className="font-bold text-primary hover:text-brand transition block truncate"
                            >
                              {post.title}
                            </Link>
                            <p className="text-xs text-muted truncate mt-0.5">
                              {excerpt(post.body)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-5 py-3.5 font-medium text-secondary text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-canvas text-[10px] font-bold text-primary uppercase border border-theme">
                            {(post.author?.username || 'Staff').slice(0, 2)}
                          </span>
                          <span className="truncate">{post.author?.username || 'Staff Editor'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="size-3" />
                            <span>Published</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-500 border border-amber-500/20">
                            <FileEdit className="size-3" />
                            <span>Draft</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-xs text-muted font-medium">
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
                            className="rounded-lg p-1.5 text-muted hover:bg-elevated hover:text-primary transition"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <Link
                            href={`/blog/${post.documentId}/edit`}
                            title="Edit Article"
                            className="rounded-lg p-1.5 text-muted hover:bg-elevated hover:text-brand transition"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletingPost({ id: post.documentId, title: post.title })}
                            disabled={busy && deletingPost?.id === post.documentId}
                            title="Delete Article"
                            className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
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

      {/* SweetAlert Article Deletion Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingPost)}
        title="Delete This Article?"
        message={`Are you sure you want to permanently delete "${deletingPost?.title}"? This post will be completely removed from the engineering blog.`}
        confirmText="Yes, Delete Article"
        cancelText="Cancel"
        loading={busy}
        onConfirm={confirmDelete}
        onClose={() => setDeletingPost(null)}
      />
    </div>
  );
};

export default function BlogManagementPage() {
  return (
    <RequireAuth roles={['Admin', 'Content Manager']}>
      <BlogManagement />
    </RequireAuth>
  );
}
