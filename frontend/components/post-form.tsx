'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Newspaper, Globe, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import { Alert, Button, Field } from '@/components/ui';
import { ImagePicker } from '@/components/image-picker';
import { RichTextEditor } from '@/components/rich-text-editor';

export type PostValues = {
  title: string;
  body: string;
  coverImageUrl: string;
  publishState: 'draft' | 'published';
};

export const PostForm = ({
  post,
  save,
  label,
}: {
  post?: BlogPost;
  save: (values: PostValues) => Promise<void>;
  label: string;
}) => {
  const [values, setValues] = useState<PostValues>({
    title: post?.title ?? '',
    body: post?.body ?? '',
    coverImageUrl: post?.coverImageUrl ?? '',
    publishState: post?.publishState ?? 'draft',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

  const lastSavedRef = useRef<PostValues>({
    title: post?.title ?? '',
    body: post?.body ?? '',
    coverImageUrl: post?.coverImageUrl ?? '',
    publishState: post?.publishState ?? 'draft',
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (post) {
      const nextValues: PostValues = {
        title: post.title ?? '',
        body: post.body ?? '',
        coverImageUrl: post.coverImageUrl ?? '',
        publishState: post.publishState ?? 'draft',
      };
      setValues(nextValues);
      lastSavedRef.current = { ...nextValues };
      setSaveStatus('idle');
    }
  }, [post?.documentId, post?.createdAt]);

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
      values.publishState !== lastSavedRef.current.publishState);

  // Debounced auto-save for existing articles (1500ms after user pauses typing)
  useEffect(() => {
    if (!post || !isDirty || !values.title.trim()) {
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
  }, [post, values, isDirty, save]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setBusy(true);
    setError('');
    setSaveStatus('saving');

    try {
      await save(values);
      lastSavedRef.current = { ...values };
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (caught) {
      setError(errorMessage(caught));
      setSaveStatus('idle');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
            <Newspaper className="size-5 text-sky-400" />
            <span>{post ? 'Edit Technical Article' : 'Write & Publish New Article'}</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Craft in-depth technical blogs, release engineering notes, and tutorials with rich Google Docs formatting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Auto-Save Status */}
          {post && (
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
            <span>{values.publishState === 'published' ? 'Public Article' : 'Draft Mode'}</span>
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

        {/* Right Column: Publication State & Cover Image (4 cols) */}
        <div className="space-y-5 lg:col-span-4">
          {/* Publication State Selector */}
          <div className="rounded-xl border border-theme bg-surface p-4 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-primary">
              Publication Visibility
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValues((prev) => ({ ...prev, publishState: 'draft' }))}
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
                onClick={() => setValues((prev) => ({ ...prev, publishState: 'published' }))}
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

          {/* Dual Upload & URL Image Picker */}
          <ImagePicker
            label="Article Cover Image / Banner"
            value={values.coverImageUrl}
            onChange={(url) => setValues((prev) => ({ ...prev, coverImageUrl: url }))}
          />
        </div>
      </div>

      <Alert>{error}</Alert>

      <div className="flex items-center gap-3 border-t border-subtle pt-4">
        <Button
          type="submit"
          disabled={busy || (post && !isDirty && saveStatus !== 'saving')}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 shadow-md shadow-sky-600/20 hover:shadow-sky-500/30"
        >
          {busy ? 'Saving Article...' : post ? 'Save changes' : label}
        </Button>

        {post && !isDirty && (
          <span className="text-xs text-muted font-medium">
            All changes synced
          </span>
        )}
      </div>
    </form>
  );
};
