'use client';

import { useState } from 'react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Collection, Lesson, Single } from '@/lib/types';
import { Alert, Empty } from '@/components/ui';
import { LessonEditor, type LessonValues } from './lesson-editor';
import { LessonList } from './lesson-list';

// The course is passed as its documentId because that is what a lesson write has to send: the
// owns-parent-course policy reads data.course out of the body and follows it to an owner before the
// create is allowed through.
export const LessonManager = ({
  course,
  onChanged,
}: {
  course: string;
  onChanged: () => Promise<void>;
}) => {
  const lessons = useApi<Collection<Lesson>>(
    `/lessons?filters[course][documentId][$eq]=${course}&sort=order:asc`
  );

  // What the panel on the right is holding: a documentId, the word new, or nothing at all.
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const rows = lessons.data?.data ?? [];
  const editing = rows.find((row) => row.documentId === selected) ?? null;

  // The header counts lessons off the course read, so a write here has to refresh both.
  const refresh = async () => {
    await lessons.reload();
    await onChanged();
  };

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setActionError('');

    try {
      await work();
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  // Left to throw on purpose: the editor is showing the form the save came from, so it is the thing
  // that should be showing the reason it failed.
  const save = async (values: LessonValues) => {
    if (editing) {
      await api.put(`/lessons/${editing.documentId}`, { data: values });
      await refresh();

      return;
    }

    // Students read the syllabus in this order, so a new lesson goes on the end rather than fighting
    // for a rung somebody else is already on.
    const order = rows.length ? Math.max(...rows.map((row) => row.order)) + 1 : 1;
    const { data } = await api.post<Single<Lesson>>('/lessons', {
      data: { ...values, order, course },
    });

    await refresh();
    setSelected(data.data.documentId);
  };

  // Two puts that trade the pair's order values, rather than one that renumbers the list. Only the
  // two rows involved change, so nothing else in the syllabus can drift.
  const move = (index: number, delta: number) =>
    run(async () => {
      const moving = rows[index];
      const other = rows[index + delta];

      if (!other) return;

      await api.put(`/lessons/${moving.documentId}`, { data: { order: other.order } });
      await api.put(`/lessons/${other.documentId}`, { data: { order: moving.order } });
      await refresh();
    });

  const remove = (lesson: Lesson) => {
    if (!window.confirm(`Delete ${lesson.title}? Any progress recorded against it goes too.`)) {
      return;
    }

    void run(async () => {
      await api.delete(`/lessons/${lesson.documentId}`);

      if (selected === lesson.documentId) setSelected('');

      await refresh();
    });
  };

  if (lessons.loading) return <p className="text-sm text-slate-500">Loading lessons</p>;

  if (lessons.error) return <Alert>{lessons.error}</Alert>;

  return (
    <div className="space-y-4">
      <Alert>{actionError}</Alert>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <LessonList
          rows={rows}
          selected={selected}
          busy={busy}
          onSelect={setSelected}
          onAdd={() => setSelected('new')}
          onMove={move}
          onRemove={remove}
        />

        {/* Keyed on the selection so switching lessons builds a fresh form. Without it the boxes
            would keep the text of whichever lesson was open first. */}
        {selected === 'new' || editing ? (
          <LessonEditor
            key={selected}
            lesson={editing}
            onSave={save}
            onCancel={() => setSelected('')}
          />
        ) : (
          <Empty>Pick a lesson to edit it, or add one.</Empty>
        )}
      </div>
    </div>
  );
};
