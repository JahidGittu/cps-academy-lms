'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Globe,
  Lock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Save,
  Send,
  Tag,
  Plus,
  X,
} from 'lucide-react';

import { errorMessage } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import { Alert, Button, Field } from '@/components/ui';
import { ImagePicker } from '@/components/image-picker';
import { RichTextEditor } from '@/components/rich-text-editor';

export type PostValues = {
  title: string;
  body: string;
  coverImageUrl: string;
  topic: string;
  publishState: 'draft' | 'published';
};

const PRESET_TOPICS = ['Architecture', 'Security', 'Tutorial', 'Database', 'DevOps', 'Frontend', 'Backend'];

export const PostForm = ({
  post,
  save,
}: {
  post?: BlogPost;
  save: (values: PostValues) => Promise<void>;
}) => {
  const isEditing = Boolean(post);

  const [values, setValues] = useState<PostValues>({
    title: post?.title ?? '',
    body: post?.body ?? '',
    coverImageUrl: post?.coverImageUrl ?? '',
    topic: post?.topic ?? 'Architecture',
    publishState: post?.publishState ?? 'draft',
  });

  const [customTagInput, setCustomTagInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<'draft' | 'published' | 'save' | null>(null);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

  const lastSavedRef = useRef<PostValues>({
    title: post?.title ?? '',
    body: post?.body ?? '',
    coverImageUrl: post?.coverImageUrl ?? '',
    topic: post?.topic ?? 'Architecture',
    publishState: post?.publishState ?? 'draft',
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (post) {
      const nextValues: PostValues = {
        title: post.title ?? '',
        body: post.body ?? '',
        coverImageUrl: post.coverImageUrl ?? '',
        topic: post.topic ?? 'Architecture',
        publishState: post.publishState ?? 'draft',
      };
      setValues(nextValues);
      lastSavedRef.current = { ...nextValues };
      setSaveStatus('idle');
    }
  }, [post?.documentId, post?.createdAt, post?.publishState, post?.topic]);

  // Parse active tags array from comma-separated string
  const activeTags = useMemo(() => {
    if (!values.topic) return [];
    return values.topic
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [values.topic]);

  const toggleTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;

    let nextTags: string[];
    const exists = activeTags.some((t) => t.toLowerCase() === trimmed.toLowerCase());

    if (exists) {
      nextTags = activeTags.filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
    } else {
      nextTags = [...activeTags, trimmed];
    }

    setValues((prev) => ({ ...prev, topic: nextTags.join(', ') }));
  };

  const addCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;

    const exists = activeTags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const nextTags = [...activeTags, trimmed];
      setValues((prev) => ({ ...prev, topic: nextTags.join(', ') }));
    }
    setCustomTagInput('');
  };

  const handleCustomTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    const nextTags = activeTags.filter((t) => t !== tagToRemove);
    setValues((prev) => ({ ...prev, topic: nextTags.join(', ') }));
  };

  const set =
    (field: keyof PostValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { value: string } }) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }));

  // Check if form has unsaved modifications
  const isDirty =
    Boolean(values.title.trim()) &&
    (values.title !== lastSavedRef.current.title ||
      values.body !== lastSavedRef.current.body ||
      values.coverImageUrl !== lastSavedRef.current.coverImageUrl ||
      values.topic !== lastSavedRef.current.topic ||
      values.publishState !== lastSavedRef.current.publishState);

  // Debounced auto-save for existing articles (1500ms after user pauses typing)
  useEffect(() => {
    if (!isEditing || !isDirty || !values.title.trim()) {
      if (!isDirty && saveStatus === 'unsaved') {
        setSaveStatus('idle');
      }
      return;
    }

    setSaveStatus('unsaved');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      setError('');

      try {
        await save(values);
        lastSavedRef.current = { ...values };
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (caught) {
        setError(errorMessage(caught));
        setSaveStatus('idle');
      }
    }, 1500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [isEditing, values, isDirty, save]);

  // Unified submit handler supporting distinct Draft and Publish triggers
  const handleSaveAction = async (targetState?: 'draft' | 'published') => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!values.title.trim()) {
      setError('Article title is required.');
      return;
    }

    const payload: PostValues = {
      ...values,
      publishState: targetState ?? values.publishState,
    };

    setBusy(true);
    setSubmittingAction(targetState ?? (isEditing ? 'save' : 'published'));
    setError('');
    setSaveStatus('saving');

    try {
      await save(payload);
      setValues(payload);
      lastSavedRef.current = { ...payload };
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (caught) {
      setError(errorMessage(caught));
      setSaveStatus('idle');
    } finally {
      setBusy(false);
      setSubmittingAction(null);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void handleSaveAction();
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
            <Newspaper className="size-5 text-sky-400" />
            <span>{isEditing ? 'Edit Technical Article' : 'Write New Article'}</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Craft in-depth technical blogs, release engineering notes, and tutorials with rich Google Docs formatting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Auto-Save Status */}
          {isEditing && (
            <div className="text-xs font-semibold">
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 text-sky-400 animate-pulse">
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Auto-saving article...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span>All changes synced</span>
                </span>
              )}
              {saveStatus === 'unsaved' && isDirty && (
                <span className="inline-flex items-center gap-1.5 text-amber-400">
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Unsaved changes</span>
                </span>
              )}
              {saveStatus === 'idle' && !isDirty && (
                <span className="text-muted text-xs font-normal">
                  ✓ Up to date
                </span>
              )}
            </div>
          )}

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold border flex items-center gap-1.5 ${
              values.publishState === 'published'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            {values.publishState === 'published' ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
            <span>{values.publishState === 'published' ? 'Published' : 'Draft'}</span>
          </span>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Title & In-Place Google Docs WYSIWYG Article Body (8 cols) */}
        <div className="space-y-5 lg:col-span-8">
          <Field
            label="Article Title"
            value={values.title}
            onChange={set('title')}
            required
            placeholder="e.g. Scaling Microservices with Kubernetes and RabbitMQ"
          />

          <RichTextEditor
            label="Article Content (Google Docs WYSIWYG Editor)"
            value={values.body}
            onChange={set('body')}
            required
            placeholder="Write your article paragraphs, format headings with H1/H2, add code blocks, and insert diagrams..."
          />
        </div>

        {/* Right Column: Publication State, Multi-Tag Selector & Cover Image (4 cols) */}
        <div className="space-y-5 lg:col-span-4">
          {/* Publication State Box (Only when editing) */}
          {isEditing && (
            <div className="rounded-xl border border-theme bg-surface p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-primary">
                  Publication Status
                </label>
                {values.publishState === 'published' && post && (
                  <Link
                    href={`/blog/${post.documentId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300"
                  >
                    <span>View Live</span>
                    <ExternalLink className="size-3" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveAction('draft')}
                  disabled={busy}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    values.publishState === 'draft'
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-400 shadow-2xs'
                      : 'border-theme bg-canvas text-muted hover:bg-elevated hover:text-primary'
                  }`}
                >
                  <Lock className="size-4 mb-1" />
                  <span>Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAction('published')}
                  disabled={busy}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    values.publishState === 'published'
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-2xs'
                      : 'border-theme bg-canvas text-muted hover:bg-elevated hover:text-primary'
                  }`}
                >
                  <Globe className="size-4 mb-1" />
                  <span>Published</span>
                </button>
              </div>
              <p className="text-[11px] text-muted">
                {values.publishState === 'published'
                  ? 'Visible on the public blog showcase for all visitors.'
                  : 'Visible only to instructors, content managers, and admins.'}
              </p>
            </div>
          )}

          {/* Multi-Tag & Category Selector Card */}
          <div className="rounded-xl border border-theme bg-surface p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-primary flex items-center gap-1.5">
                <Tag className="size-3.5 text-sky-400" />
                <span>Article Tags ({activeTags.length})</span>
              </label>
              <span className="text-[10px] text-muted font-medium">Click to toggle multiple</span>
            </div>

            {/* Selected Active Tag Pills */}
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-canvas border border-theme">
                {activeTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 text-xs font-bold"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 cursor-pointer p-0.5"
                      title={`Remove ${tag}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Multi-Select Topic Preset Badges */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold text-muted">Popular Topics:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TOPICS.map((topic) => {
                  const isSelected = activeTags.some((t) => t.toLowerCase() === topic.toLowerCase());
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTag(topic)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'brand-gradient text-white shadow-xs border border-transparent'
                          : 'bg-canvas text-secondary border border-theme hover:bg-elevated hover:text-primary'
                      }`}
                    >
                      <span>{topic}</span>
                      {isSelected ? <CheckCircle2 className="size-3" /> : <Plus className="size-3 text-muted" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Tag Input with Enter / + Button */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleCustomTagKeyDown}
                placeholder="Add custom tag (press Enter)..."
                className="w-full rounded-lg border border-theme bg-canvas px-3 py-1.5 text-xs text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={!customTagInput.trim()}
                className="rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white p-1.5 text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                title="Add tag"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Dual Upload & URL Image Picker */}
          <ImagePicker
            label="Article Cover Image / Banner"
            value={values.coverImageUrl}
            onChange={(url) => setValues((prev) => ({ ...prev, coverImageUrl: url }))}
          />
        </div>
      </div>

      <Alert>{error}</Alert>

      {/* Bottom Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-4">
        {/* If creating a new post: Offer distinct 'Save as Draft' vs 'Publish Article' */}
        {!isEditing ? (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleSaveAction('draft')}
              className="flex items-center justify-center gap-2 rounded-xl border border-theme bg-surface hover:bg-elevated text-secondary hover:text-primary px-5 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Save className="size-4 text-muted" />
              <span>{submittingAction === 'draft' ? 'Saving Draft...' : 'Save as Draft'}</span>
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => handleSaveAction('published')}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition cursor-pointer"
            >
              <Send className="size-4" />
              <span>{submittingAction === 'published' ? 'Publishing...' : 'Publish Article'}</span>
            </button>
          </div>
        ) : (
          /* If editing existing post: Provide direct Save & Publish/Unpublish toggle */
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={busy || (!isDirty && saveStatus !== 'saving')}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 shadow-md shadow-sky-600/20 hover:shadow-sky-500/30"
            >
              {busy ? 'Saving...' : 'Save changes'}
            </Button>

            {values.publishState === 'draft' ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => handleSaveAction('published')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-emerald-600/20 transition cursor-pointer"
              >
                <Globe className="size-3.5" />
                <span>Publish Now</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => handleSaveAction('draft')}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                <Lock className="size-3.5" />
                <span>Move to Draft</span>
              </button>
            )}

            {!isDirty && (
              <span className="text-xs text-muted font-medium">
                All changes synced
              </span>
            )}
          </div>
        )}

        <Link
          href="/admin/blog-management"
          className="text-xs text-muted hover:text-primary font-semibold transition"
        >
          Back to Blog Management
        </Link>
      </div>
    </form>
  );
};
