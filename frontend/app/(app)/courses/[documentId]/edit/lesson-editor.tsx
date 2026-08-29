'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { CheckCircle2, Play, RefreshCw, Video } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import type { Lesson } from '@/lib/types';
import { Alert, Button, Field } from '@/components/ui';
import { RichTextEditor } from '@/components/rich-text-editor';

export type LessonValues = { title: string; videoUrl: string; content: string };

const getEmbedVideoUrl = (url: string) => {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  // YouTube watch / share / embed / shorts
  const ytMatch = trimmed.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Direct MP4 / WebM / OGG video file
  if (trimmed.match(/\.(mp4|webm|ogg)$/i) || trimmed.startsWith('blob:') || trimmed.startsWith('data:video')) {
    return trimmed;
  }

  return null;
};

export const LessonEditor = ({
  lesson,
  onSave,
  onCancel,
}: {
  lesson: Lesson | null;
  onSave: (values: LessonValues) => Promise<void>;
  onCancel: () => void;
}) => {
  const getSnapshot = (l: Lesson | null): LessonValues => ({
    title: l?.title ?? '',
    videoUrl: l?.videoUrl ?? '',
    content: l?.content ?? '',
  });

  const [values, setValues] = useState<LessonValues>(() => getSnapshot(lesson));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

  const lastSavedRef = useRef<LessonValues>(getSnapshot(lesson));
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const latestValues = useRef(values);
  latestValues.current = values;

  // Sync state if lesson selection changes without triggering false dirty save
  useEffect(() => {
    const snapshot = getSnapshot(lesson);
    lastSavedRef.current = snapshot;
    setValues(snapshot);
    setSaveStatus('idle');
  }, [lesson?.documentId, lesson?.id]);

  const isDirty =
    Boolean(lesson) &&
    (values.title !== lastSavedRef.current.title ||
      values.videoUrl !== lastSavedRef.current.videoUrl ||
      values.content !== lastSavedRef.current.content);

  // Debounced auto-save ONLY when actual unsaved changes exist (1500ms debounce)
  useEffect(() => {
    if (!lesson || !isDirty || !values.title.trim()) {
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
        await onSave(latestValues.current);
        lastSavedRef.current = { ...latestValues.current };
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
  }, [values.title, values.videoUrl, values.content, isDirty, lesson]);

  const set =
    (field: keyof LessonValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setBusy(true);
    setError('');

    try {
      await onSave(values);
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

  const videoEmbed = getEmbedVideoUrl(values.videoUrl);

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-lg border border-theme bg-surface p-5 shadow-2xs"
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-subtle pb-3">
        <h2 className="truncate text-sm font-bold text-primary">
          {lesson ? lesson.title : 'New Lesson'}
        </h2>

        {lesson ? (
          <div className="text-xs">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-brand animate-pulse">
                <RefreshCw className="size-3 animate-spin" />
                <span>Auto-saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-500">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'unsaved' && isDirty && (
              <span className="inline-flex items-center gap-1.5 text-amber-500 font-medium">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes</span>
              </span>
            )}
            {saveStatus === 'idle' && !isDirty && (
              <span className="inline-flex items-center gap-1 text-muted text-[11px]">
                <span>✓ Up to date</span>
              </span>
            )}
          </div>
        ) : (
          saveStatus === 'saved' && <span className="shrink-0 text-xs font-bold text-emerald-500">✓ Created!</span>
        )}
      </div>

      <Field label="Lesson Title" value={values.title} onChange={set('title')} placeholder="e.g. Introduction to CSS Flexbox" required />

      {/* Video URL Input & Live Video Player Preview */}
      <div className="space-y-2.5">
        <Field
          label="Video URL (Optional)"
          value={values.videoUrl}
          onChange={set('videoUrl')}
          placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
        />

        {videoEmbed ? (
          <div className="overflow-hidden rounded-xl border border-theme bg-canvas p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Play className="size-3.5 text-brand fill-brand/20" />
                <span>Live Video Player Preview</span>
              </span>
              <span className="text-[11px] font-medium text-emerald-500">✓ Stream Ready</span>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/80 border border-theme">
              {videoEmbed.includes('youtube.com') || videoEmbed.includes('vimeo.com') ? (
                <iframe
                  src={videoEmbed}
                  title="Lesson video preview"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={videoEmbed} controls className="h-full w-full object-contain" />
              )}
            </div>
          </div>
        ) : values.videoUrl.trim() ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-400">
            <Video className="size-4 shrink-0" />
            <span>Enter a standard YouTube (watch/shorts/embed) or Vimeo link for live streaming.</span>
          </div>
        ) : null}
      </div>

      <RichTextEditor
        label="Lesson Content & Materials"
        value={values.content}
        onChange={set('content')}
        placeholder="Type or paste lesson notes, markdown, and embed code blocks..."
        rows={10}
      />

      <Alert>{error}</Alert>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={busy || (Boolean(lesson) && !isDirty && saveStatus !== 'saving')}
          >
            {busy ? 'Saving...' : lesson ? 'Save lesson' : 'Create lesson'}
          </Button>
          <Button variant="plain" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};
