'use client';

import { useState, useEffect } from 'react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Collection, Lesson, Single } from '@/lib/types';
import { Alert, Empty, LoadingState } from '@/components/ui';
import { ConfirmModal } from '@/components/confirm-modal';
import { LessonEditor, type LessonValues } from './lesson-editor';
import { LessonList } from './lesson-list';

// The course is passed as its documentId
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

  // Keep local ordered list for instant optimistic rendering without UI jumping
  const [localLessons, setLocalLessons] = useState<Lesson[]>([]);
  // What the panel on the right is holding: a documentId, the word 'new', or empty
  const [selected, setSelected] = useState('new');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  // Synchronize server lessons into local state and auto-open first lesson or new form
  useEffect(() => {
    if (lessons.data?.data) {
      const sorted = [...lessons.data.data].sort((a, b) => a.order - b.order);
      setLocalLessons(sorted);

      setSelected((prev) => {
        // If current selection is valid, keep it
        if (prev && (prev === 'new' || sorted.some((l) => l.documentId === prev))) {
          return prev;
        }
        // Otherwise default to 1st lesson if available, or 'new' form
        return sorted.length > 0 ? sorted[0].documentId : 'new';
      });
    } else if (!lessons.loading) {
      setSelected('new');
    }
  }, [lessons.data, lessons.loading]);

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

  // Instant optimistic reorder that maintains active lesson state
  const move = (index: number, delta: number) =>
    run(async () => {
      const moving = rows[index];
      const other = rows[index + delta];

      if (!moving || !other) return;

      const currentSelected = selected;

      // Optimistic swap
      const reordered = [...rows];
      reordered[index] = other;
      reordered[index + delta] = moving;
      setLocalLessons(reordered);
      setSelected(currentSelected);

      try {
        await Promise.all([
          api.put(`/lessons/${moving.documentId}`, { data: { order: other.order } }),
          api.put(`/lessons/${other.documentId}`, { data: { order: moving.order } }),
        ]);
        await refresh();
      } catch (err) {
        await lessons.reload();
        throw err;
      }
    });

  // Delete lesson confirmation
  const confirmDeleteLesson = () => {
    if (!lessonToDelete) return;
    const lesson = lessonToDelete;

    run(async () => {
      if (selected === lesson.documentId) {
        const remaining = rows.filter((r) => r.documentId !== lesson.documentId);
        setSelected(remaining.length > 0 ? remaining[0].documentId : 'new');
      }

      await api.delete(`/lessons/${lesson.documentId}`);
      await refresh();
      setLessonToDelete(null);
    });
  };

  // Guard initial loading only
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
          onRemove={(lesson) => setLessonToDelete(lesson)}
        />

        {/* Keyed on the selection so switching lessons builds a fresh form */}
        {selected === 'new' || editing ? (
          <LessonEditor
            key={selected}
            lesson={editing}
            onSave={save}
            onCancel={() => setSelected(rows.length > 0 ? rows[0].documentId : 'new')}
          />
        ) : (
          <Empty>
            <p className="text-base font-bold text-primary">No Lesson Selected</p>
            <p className="text-xs text-muted mt-1">Select a lesson from the syllabus or add a new one.</p>
          </Empty>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(lessonToDelete)}
        title="Delete This Lesson?"
        message={`Are you sure you want to delete "${lessonToDelete?.title}"? Any student progress recorded against it will also be deleted.`}
        confirmText="Yes, Delete Lesson"
        cancelText="Cancel"
        loading={busy}
        onConfirm={confirmDeleteLesson}
        onClose={() => setLessonToDelete(null)}
      />
    </div>
  );
};
