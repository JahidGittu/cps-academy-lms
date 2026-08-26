'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { errorMessage } from '@/lib/api';
import type { Lesson } from '@/lib/types';
import { Alert, Button, Field, TextField } from '@/components/ui';

export type LessonValues = { title: string; videoUrl: string; content: string };

// No position field. Where a lesson sits is what the arrows in the syllabus are for, and a number box
// beside them is a second way to say the same thing that can disagree with the first.
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
  const [saved, setSaved] = useState(false);

  const set =
    (field: keyof LessonValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSaved(false);
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await onSave(values);
      setSaved(true);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 pb-3">
        <h2 className="truncate text-sm font-medium">
          {lesson ? lesson.title : 'New lesson'}
        </h2>

        {saved && <span className="shrink-0 text-xs text-emerald-600">Saved</span>}
      </div>

      <Field label="Title" value={values.title} onChange={set('title')} required />

      <Field
        label="Video URL"
        value={values.videoUrl}
        onChange={set('videoUrl')}
        placeholder="https://www.youtube.com/watch?v="
      />

      <TextField
        label="Content (Markdown)"
        value={values.content}
        onChange={set('content')}
        rows={14}
      />

      <p className="text-xs text-slate-500">
        A lesson can be a video, a written page, or both. Whatever is filled in is what students see.
      </p>

      <Alert>{error}</Alert>

      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving' : 'Save lesson'}
        </Button>

        <Button type="button" variant="plain" onClick={onCancel}>
          Close
        </Button>
      </div>
    </form>
  );
};
