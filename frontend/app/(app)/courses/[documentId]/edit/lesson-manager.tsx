'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Collection, Lesson } from '@/lib/types';
import { Alert, Button, Empty, Field, TextField } from '@/components/ui';

type Values = { title: string; order: string; videoUrl: string; content: string };

// order is held as a string because that is what a number input gives back, and an empty box has to
// stay empty while it is being retyped rather than jumping to 0.
const valuesOf = (lesson: Lesson): Values => ({
  title: lesson.title,
  order: String(lesson.order),
  videoUrl: lesson.videoUrl ?? '',
  content: lesson.content ?? '',
});

const LessonForm = ({
  initial,
  save,
  onClose,
}: {
  initial: Values;
  save: (values: Values) => Promise<void>;
  onClose: () => void;
}) => {
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set =
    (field: keyof Values) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await save(values);
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 bg-slate-50 px-4 py-4">
      <Field label="Title" value={values.title} onChange={set('title')} required />

      <Field
        label="Position"
        type="number"
        min={1}
        value={values.order}
        onChange={set('order')}
        required
      />

      <Field
        label="Video URL"
        value={values.videoUrl}
        onChange={set('videoUrl')}
        placeholder="https://www.youtube.com/watch?v="
      />

      <TextField label="Content (Markdown)" value={values.content} onChange={set('content')} />

      <Alert>{error}</Alert>

      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving' : 'Save lesson'}
        </Button>

        <Button type="button" variant="plain" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

// The course is passed as its documentId because that is what a lesson write has to send: the
// owns-parent-course policy reads data.course out of the body and follows it to an owner before the
// create is allowed through.
export const LessonManager = ({ course }: { course: string }) => {
  const lessons = useApi<Collection<Lesson>>(
    `/lessons?filters[course][documentId][$eq]=${course}&sort=order:asc`
  );

  // Which row has the form open: a documentId, or the word new. One at a time, so a half typed
  // lesson cannot be left behind on a row nobody is looking at any more.
  const [open, setOpen] = useState('');
  const [actionError, setActionError] = useState('');

  const rows = lessons.data?.data ?? [];

  const close = async () => {
    setOpen('');
    await lessons.reload();
  };

  const body = (values: Values) => ({
    title: values.title,
    order: Number(values.order),
    videoUrl: values.videoUrl,
    content: values.content,
  });

  const remove = async (lesson: Lesson) => {
    if (!window.confirm(`Delete ${lesson.title}? Any progress recorded against it goes too.`)) {
      return;
    }

    setActionError('');

    try {
      await api.delete(`/lessons/${lesson.documentId}`);
      await lessons.reload();
    } catch (caught) {
      setActionError(errorMessage(caught));
    }
  };

  if (lessons.loading) return <p className="text-sm text-slate-500">Loading lessons</p>;

  if (lessons.error) return <Alert>{lessons.error}</Alert>;

  // Students read the lessons in this order, so a new one goes on the end rather than fighting for a
  // position somebody has already used.
  const nextOrder = rows.length ? Math.max(...rows.map((row) => row.order)) + 1 : 1;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium">Lessons</h2>

        {open !== 'new' && (
          <Button variant="plain" onClick={() => setOpen('new')}>
            Add lesson
          </Button>
        )}
      </div>

      <Alert>{actionError}</Alert>

      {!rows.length && open !== 'new' && <Empty>No lessons yet.</Empty>}

      {(rows.length > 0 || open === 'new') && (
        <div className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {rows.map((lesson) =>
            open === lesson.documentId ? (
              <LessonForm
                key={lesson.documentId}
                initial={valuesOf(lesson)}
                onClose={() => void close()}
                save={async (values) => {
                  await api.put(`/lessons/${lesson.documentId}`, { data: body(values) });
                  await close();
                }}
              />
            ) : (
              <div key={lesson.documentId} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-5 shrink-0 text-slate-400">{lesson.order}</span>

                <span className="flex-1">{lesson.title}</span>

                <button
                  onClick={() => setOpen(lesson.documentId)}
                  className="text-xs text-slate-500 underline hover:text-slate-900"
                >
                  Edit
                </button>

                <button
                  onClick={() => void remove(lesson)}
                  className="text-xs text-red-600 underline hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            )
          )}

          {open === 'new' && (
            <LessonForm
              initial={{ title: '', order: String(nextOrder), videoUrl: '', content: '' }}
              onClose={() => void close()}
              save={async (values) => {
                await api.post('/lessons', { data: { ...body(values), course } });
                await close();
              }}
            />
          )}
        </div>
      )}
    </section>
  );
};
