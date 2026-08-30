'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import {
  Newspaper, Globe, Lock, CheckCircle2, RefreshCw, ExternalLink, Save, Send,
} from 'lucide-react';

import { errorMessage } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import { Alert, Button, Field } from '@/components/ui';
import { ImagePicker } from '@/components/image-picker';
import { RichTextEditor } from '@/components/rich-text-editor';
import { PostTags } from '@/components/post-tags';

export type PostValues = {
  title: string;
  body: string;
  coverImageUrl: string;
  topic: string;
  publishState: 'draft' | 'published';
};



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
    topic: post?.topic ?? '',
    publishState: post?.publishState ?? 'draft',
  });

  const [busy, setBusy] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<'draft' | 'published' | 'save' | null>(null);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

  const lastSavedRef = useRef<PostValues>({
    title: post?.title ?? '',
    body: post?.body ?? '',
    coverImageUrl: post?.coverImageUrl ?? '',
    topic: post?.topic ?? '',
    publishState: post?.publishState ?? 'draft',
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const initializedDocIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (post && post.documentId !== initializedDocIdRef.current) {
      initializedDocIdRef.current = post.documentId;
      const nextValues: PostValues = {
        title: post.title ?? '',
        body: post.body ?? '',
        coverImageUrl: post.coverImageUrl ?? '',
        topic: post.topic ?? '',
        publishState: post.publishState ?? 'draft',
      };
      setValues(nextValues);
      latestValues.current = { ...nextValues };
      lastSavedRef.current = { ...nextValues };
      setSaveStatus('idle');
    }
  }, [post?.documentId]);

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
    const currentTags = latestValues.current.topic
      ? latestValues.current.topic.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    const exists = currentTags.some((t) => t.toLowerCase() === trimmed.toLowerCase());

    if (exists) {
      nextTags = currentTags.filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
    } else {
      nextTags = [...currentTags, trimmed];
    }

    const nextTopic = nextTags.join(', ');
    setValues((prev) => ({ ...prev, topic: nextTopic }));
    latestValues.current = { ...latestValues.current, topic: nextTopic };
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = latestValues.current.topic
      ? latestValues.current.topic.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    const nextTags = currentTags.filter((t) => t !== tagToRemove);
    const nextTopic = nextTags.join(', ');
    setValues((prev) => ({ ...prev, topic: nextTopic }));
    latestValues.current = { ...latestValues.current, topic: nextTopic };
  };

  const set =
    (field: keyof PostValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { value: string } }) => {
      const nextVal = event.target.value;
      setValues((prev) => ({ ...prev, [field]: nextVal }));
      latestValues.current = { ...latestValues.current, [field]: nextVal };
    };

  // Keep latest form state accessible in async callbacks
  const latestValues = useRef<PostValues>(values);
  latestValues.current = values;

  const saveRef = useRef(save);
  saveRef.current = save;

  const isSavingRef = useRef(false);

  const isDirty =
    Boolean(values.title.trim()) &&
    (values.title !== lastSavedRef.current.title ||
      values.body !== lastSavedRef.current.body ||
      values.coverImageUrl !== lastSavedRef.current.coverImageUrl ||
      values.topic !== lastSavedRef.current.topic ||
      values.publishState !== lastSavedRef.current.publishState);

  useEffect(() => {
    if (!isEditing || !isDirty || !values.title.trim() || isSavingRef.current) {
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
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      setSaveStatus('saving');
      setError('');

      try {
        const payloadToSave = { ...latestValues.current };
        await saveRef.current(payloadToSave);
        lastSavedRef.current = { ...payloadToSave };
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (caught) {
        setError(errorMessage(caught));
        setSaveStatus('idle');
      } finally {
        isSavingRef.current = false;
      }
    }, 1500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [isEditing, isDirty, values.title, values.body, values.coverImageUrl, values.topic, values.publishState]);

  const handleSaveAction = async (targetState?: 'draft' | 'published') => {
    if (isSavingRef.current || busy) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    const currentValues = { ...values, ...latestValues.current };
    if (!currentValues.title.trim()) {
      setError('Article title is required.');
      return;
    }

    const payload: PostValues = {
      title: currentValues.title.trim(),
      body: currentValues.body,
      coverImageUrl: currentValues.coverImageUrl || values.coverImageUrl || '',
      topic: currentValues.topic,
      publishState: targetState ?? currentValues.publishState,
    };

    isSavingRef.current = true;
    setBusy(true);
    setSubmittingAction(targetState ?? (isEditing ? 'save' : 'published'));
    setError('');
    setSaveStatus('saving');

    try {
      await saveRef.current(payload);
      setValues(payload);
      latestValues.current = { ...payload };
      lastSavedRef.current = { ...payload };
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (caught) {
      setError(errorMessage(caught));
      setSaveStatus('idle');
    } finally {
      isSavingRef.current = false;
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
            <span>{isEditing ? 'Edit Article' : 'New Article'}</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Write blog posts, tutorials, and engineering notes for the platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-5 lg:col-span-8">
          <Field
            label="Article Title"
            value={values.title}
            onChange={set('title')}
            required
            placeholder="e.g. Building a scalable REST API with Node.js"
          />

          <RichTextEditor
            label="Article Content"
            value={values.body}
            onChange={set('body')}
            required
            placeholder="Write your article here..."
          />
        </div>

        <div className="space-y-5 lg:col-span-4">
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

          <PostTags
            activeTags={activeTags}
            onToggle={toggleTag}
            onAdd={(tag) => {
              const current = latestValues.current.topic
                ? latestValues.current.topic.split(',').map((t) => t.trim()).filter(Boolean)
                : [];
              if (!current.some((t) => t.toLowerCase() === tag.toLowerCase())) {
                const next = [...current, tag].join(', ');
                setValues((prev) => ({ ...prev, topic: next }));
                latestValues.current = { ...latestValues.current, topic: next };
              }
            }}
            onRemove={removeTag}
          />

          <ImagePicker
            label="Cover Image"
            value={values.coverImageUrl}
            category="blog"
            onChange={(url) => {
              setValues((prev) => ({ ...prev, coverImageUrl: url }));
              latestValues.current = { ...latestValues.current, coverImageUrl: url };
            }}
          />
        </div>
      </div>

      <Alert>{error}</Alert>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-4">
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
