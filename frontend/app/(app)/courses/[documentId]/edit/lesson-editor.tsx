'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import type { Lesson } from '@/lib/types';
import { Alert, Button, Field } from '@/components/ui';
import { RichTextEditor } from '@/components/rich-text-editor';

export type LessonValues = { title: string; videoUrl: string; content: string };

export const LessonEditor = ({
  lesson,
  onSave,
  onCancel,
}: {
  lesson: Lesson | null;
  onSave: (values: LessonValues) => Promise<void>;
  onCancel: () => void;
}) => {
  const [values, setValues] = useState<LessonValues>({
    title: lesson?.title ?? '',
    videoUrl: lesson?.videoUrl ?? '',
    content: lesson?.content ?? '',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

  const isInitialMount = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const latestValues = useRef(values);
  latestValues.current = values;

  // Debounced auto-save for existing lessons (1200ms debounce)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only auto-save if editing an existing lesson and title is present
    if (!lesson || !values.title.trim()) return;

    setSaveStatus('unsaved');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      setError('');

      try {
        await onSave(latestValues.current);
        setSaveStatus('saved');
      } catch (caught) {
        setError(errorMessage(caught));
        setSaveStatus('idle');
      }
    }, 1200);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [values.title, values.videoUrl, values.content, lesson]);

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
      setSaveStatus('saved');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

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
            {saveStatus === 'unsaved' && (
              <span className="inline-flex items-center gap-1.5 text-muted font-medium">
                <span className="size-1.5 rounded-full bg-amber-500" />
                <span>Unsaved changes</span>
              </span>
            )}
          </div>
        ) : (
          saveStatus === 'saved' && <span className="shrink-0 text-xs font-bold text-emerald-500">✓ Created!</span>
        )}
      </div>

      <Field label="Lesson Title" value={values.title} onChange={set('title')} placeholder="e.g. Introduction to CSS Flexbox" required />

      <Field
        label="Video URL (Optional)"
        value={values.videoUrl}
        onChange={set('videoUrl')}
        placeholder="https://www.youtube.com/watch?v=..."
      />

      <RichTextEditor
        label="Lesson Content"
        value={values.content}
        onChange={set('content')}
        placeholder="Write lesson notes, explanations, code snippets, or instructions..."
        rows={12}
      />

      <p className="text-xs text-muted">
        A lesson can be a video, a written page, or both. Whatever is filled in is what students see.
      </p>

      <Alert>{error}</Alert>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving...' : lesson ? 'Save lesson' : 'Create lesson'}
        </Button>

        <Button type="button" variant="plain" onClick={onCancel}>
          Close
        </Button>

        {lesson && saveStatus === 'saved' && (
          <span className="text-xs font-medium text-muted hidden sm:inline">
            ✓ Auto-synced with cloud
          </span>
        )}
      </div>
    </form>
  );
};
