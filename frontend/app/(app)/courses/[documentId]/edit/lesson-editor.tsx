'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { CheckCircle2, FileText, Play, RefreshCw, Video } from 'lucide-react';

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
  onNext,
}: {
  lesson: Lesson | null;
  onSave: (values: LessonValues) => Promise<void>;
  onCancel?: () => void;
  onNext?: () => void;
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
    }, 1000);

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
      className="overflow-hidden rounded-xl border border-theme bg-surface shadow-2xs"
    >
      {/* Studio Banner Header Matching Screenshot */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-3.5 text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
            <FileText className="size-4" />
          </div>
          <h2 className="truncate text-sm sm:text-base font-bold text-white">
            {lesson ? `Editing: ${lesson.title}` : 'Create New Lesson'}
          </h2>
        </div>

        {lesson ? (
          <div className="shrink-0">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white shadow-inner animate-pulse">
                <RefreshCw className="size-3.5 animate-spin text-sky-200" />
                <span>Auto-saving to cloud...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-200 shadow-xs animate-in fade-in">
                <CheckCircle2 className="size-3.5 text-emerald-300" />
                <span>All changes synced</span>
              </span>
            )}
            {saveStatus === 'unsaved' && isDirty && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/25 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-200 shadow-xs">
                <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Unsaved changes...</span>
              </span>
            )}
            {saveStatus === 'idle' && !isDirty && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/90 font-medium">
                <span>✓ Up to date</span>
              </span>
            )}
          </div>
        ) : (
          saveStatus === 'saved' && (
            <span className="shrink-0 rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-200">
              ✓ Created!
            </span>
          )
        )}
      </div>

      {/* Form Fields Inside Card Body */}
      <div className="p-5 space-y-4">
        <Field
          label="Lesson Title"
          value={values.title}
          onChange={set('title')}
          placeholder="e.g. Introduction to Containerization & Docker"
          required
        />

        {/* Video URL Input & Live Video Player Preview */}
        <div className="space-y-2.5">
          <Field
            label="Video URL (Optional: YouTube, Vimeo, MP4)"
            value={values.videoUrl}
            onChange={set('videoUrl')}
            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
          />

          {videoEmbed ? (
            <div className="overflow-hidden rounded-xl border border-theme bg-canvas p-3 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Play className="size-3.5 text-sky-400 fill-sky-400/20" />
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
          placeholder="Write lesson notes, code snippets, analysis, and materials..."
          rows={10}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-4">
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={busy || (Boolean(lesson) && !isDirty && saveStatus !== 'saving')}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 shadow-md shadow-sky-600/20 hover:shadow-sky-500/30 transition-all"
            >
              {busy ? 'Saving...' : lesson ? 'Save Lesson' : 'Create Lesson'}
            </Button>
          </div>

          {/* Right side: Next button when provided, otherwise autosave status */}
          {onNext ? (
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-sky-600/25 transition cursor-pointer"
            >
              Next: Quiz Assessment →
            </button>
          ) : (
            <div className="text-xs">
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 font-bold text-sky-400 animate-pulse">
                  <RefreshCw className="size-3.5 animate-spin text-sky-400" />
                  <span>Auto-saving to cloud...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span>All changes saved & synced</span>
                </span>
              )}
              {saveStatus === 'unsaved' && isDirty && (
                <span className="inline-flex items-center gap-1.5 font-medium text-amber-400">
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Unsaved changes (auto-saving...)</span>
                </span>
              )}
              {saveStatus === 'idle' && !isDirty && Boolean(lesson) && (
                <span className="inline-flex items-center gap-1 text-muted font-medium">
                  <span>✓ All changes synced</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
