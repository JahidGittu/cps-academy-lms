'use client';

import { useState, useEffect } from 'react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Collection, Lesson, Single } from '@/lib/types';
import { Alert, Empty, LoadingState } from '@/components/ui';
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

  // Keep local ordered list for instant optimistic rendering without UI jumping or deselecting
  const [localLessons, setLocalLessons] = useState<Lesson[]>([]);
  // What the panel on the right is holding: a documentId, the word 'new', or empty
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  // Synchronize server lessons into local state
  useEffect(() => {
    if (lessons.data?.data) {
      const sorted = [...lessons.data.data].sort((a, b) => a.order - b.order);
      setLocalLessons(sorted);
    }
  }, [lessons.data]);

  const rows = localLessons;
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

  // Save lesson handler
  const save = async (values: LessonValues) => {
    if (editing) {
      await api.put(`/lessons/${editing.documentId}`, { data: values });
      await refresh();
      return;
    }

    // Students read the syllabus in this order, so a new lesson goes on the end
    const order = rows.length ? Math.max(...rows.map((row) => row.order)) + 1 : 1;
    const { data } = await api.post<Single<Lesson>>('/lessons', {
      data: { ...values, order, course },
    });

    await refresh();
    setSelected(data.data.documentId);
  };

  // Instant optimistic reorder that maintains active lesson state and zero UI flickering
  const move = (index: number, delta: number) =>
    run(async () => {
      const moving = rows[index];
      const other = rows[index + delta];

      if (!moving || !other) return;

      const currentSelected = selected;

      // 1. Optimistically swap in local UI state immediately
      const nextList = [...rows];
      const movingNewOrder = other.order;
      const otherNewOrder = moving.order;

      nextList[index] = { ...other, order: otherNewOrder };
      nextList[index + delta] = { ...moving, order: movingNewOrder };
      setLocalLessons(nextList);

      // 2. Persist order values to backend in background
      await api.put(`/lessons/${moving.documentId}`, { data: { order: movingNewOrder } });
      await api.put(`/lessons/${other.documentId}`, { data: { order: otherNewOrder } });

      // 3. Silently revalidate without unmounting
      await refresh();

      // 4. Ensure active lesson stays selected
      if (currentSelected) {
        setSelected(currentSelected);
      }
    });

  const remove = (lesson: Lesson) => {
    if (!window.confirm(`Delete "${lesson.title}"? Any student progress recorded against it will also be deleted.`)) {
      return;
    }

    void run(async () => {
      // Optimistic removal
      setLocalLessons((prev) => prev.filter((l) => l.documentId !== lesson.documentId));
      if (selected === lesson.documentId) {
        setSelected('');
      }

      await api.delete(`/lessons/${lesson.documentId}`);
      await refresh();
    });
  };

  // Guard initial loading only (do not unmount on subsequent background reloads)
  if (lessons.loading && !lessons.data) {
    return <LoadingState />;
  }

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

        {/* Keyed on the selection so switching lessons builds a fresh form */}
        {selected === 'new' || editing ? (
          <LessonEditor
            key={selected}
            lesson={editing}
            onSave={save}
            onCancel={() => setSelected('')}
          />
        ) : (
          <Empty>
            <p className="text-base font-bold text-slate-800">No Lesson Selected</p>
            <p className="text-xs text-slate-500 mt-1">Select a lesson from the syllabus or add a new one.</p>
          </Empty>
        )}
      </div>
    </div>
  );
};
