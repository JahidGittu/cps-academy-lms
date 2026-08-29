'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Layers, Plus, Video, FileText } from 'lucide-react';

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
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get('lesson');

  const lessons = useApi<Collection<Lesson>>(
    `/lessons?filters[course][documentId][$eq]=${course}&sort=order:asc`
  );

  // Keep local ordered list for instant optimistic rendering without UI jumping
  const [localLessons, setLocalLessons] = useState<Lesson[]>([]);
  // What the panel on the right is holding: a documentId, the word 'new', or empty
  const [selected, setSelected] = useState(lessonParam || 'new');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  // Synchronize server lessons into local state and auto-open targeted lesson, first lesson, or new form
  useEffect(() => {
    if (lessons.data?.data) {
      const sorted = [...lessons.data.data].sort((a, b) => a.order - b.order);
      setLocalLessons(sorted);

      setSelected((prev) => {
        // If URL explicitly requested a specific lesson, select it!
        if (lessonParam && sorted.some((l) => l.documentId === lessonParam)) {
          return lessonParam;
        }
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
  }, [lessons.data, lessons.loading, lessonParam]);

  const handleSelect = (id: string) => {
    setSelected(id);
    const url = `/courses/${course}/edit?tab=lessons${id === 'new' ? '' : `&lesson=${id}`}`;
    window.history.replaceState(null, '', url);
  };

  const rows = localLessons;
  const editing = rows.find((row) => row.documentId === selected) ?? null;

  const videoLessonsCount = rows.filter((r) => Boolean(r.videoUrl?.trim())).length;
  const readingMaterialsCount = rows.filter((r) => Boolean(r.content?.trim())).length;

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

  // Save lesson handler with optimistic in-place title update
  const save = async (values: LessonValues) => {
    if (editing) {
      // Optimistic update in list immediately
      setLocalLessons((prev) =>
        prev.map((l) => (l.documentId === editing.documentId ? { ...l, ...values } : l))
      );

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
    handleSelect(data.data.documentId);
  };

  // Truly instant optimistic reorder with zero-buffering background sync
  const move = async (index: number, delta: number) => {
    const moving = rows[index];
    const other = rows[index + delta];

    if (!moving || !other) return;

    // 1. Instant local swap and order assignment
    const reordered = [...rows];
    const newOrderMoving = other.order;
    const newOrderOther = moving.order;

    reordered[index] = { ...other, order: newOrderOther };
    reordered[index + delta] = { ...moving, order: newOrderMoving };

    setLocalLessons(reordered);

    // 2. Perform database order update quietly in background without full page reloads
    try {
      await Promise.all([
        api.put(`/lessons/${moving.documentId}`, { data: { order: newOrderMoving } }),
        api.put(`/lessons/${other.documentId}`, { data: { order: newOrderOther } }),
      ]);
    } catch (caught) {
      setActionError(errorMessage(caught));
      await lessons.reload();
    }
  };

  // Delete lesson confirmation
  const confirmDeleteLesson = () => {
    if (!lessonToDelete) return;
    const lesson = lessonToDelete;

    run(async () => {
      if (selected === lesson.documentId) {
        const remaining = rows.filter((r) => r.documentId !== lesson.documentId);
        handleSelect(remaining.length > 0 ? remaining[0].documentId : 'new');
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
    <div className="space-y-5">
      {/* Top Curriculum Header Strip */}
      <div className="rounded-xl border border-theme bg-surface p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary flex items-center gap-2.5">
            <Layers className="size-6 text-sky-400" />
            <span>Curriculum & Syllabus Track</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Sequential lesson progression &bull; Students unlock and complete lessons in this exact order.
          </p>

          {/* Quick Stats Strip */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2.5 py-1">
              <BookOpen className="size-3.5" />
              <span>{rows.length} Total Lessons</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2.5 py-1">
              <Video className="size-3.5" />
              <span>{videoLessonsCount} Video Lectures</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1">
              <FileText className="size-3.5" />
              <span>{readingMaterialsCount} Reading Materials & Notes</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSelect('new')}
          className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-sky-600/25 hover:shadow-sky-500/35 cursor-pointer transition-all"
        >
          <Plus className="size-4" />
          <span>Add New Lesson</span>
        </button>
      </div>

      <Alert>{actionError}</Alert>

      {/* Split Grid: Syllabus Tree on Left (360px) and Editor on Right */}
      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <LessonList
          rows={rows}
          selected={selected}
          busy={busy}
          onSelect={handleSelect}
          onAdd={() => handleSelect('new')}
          onMove={move}
          onRemove={(lesson) => setLessonToDelete(lesson)}
        />

        {/* Keyed on the selection so switching lessons builds a fresh form */}
        {selected === 'new' || editing ? (
          <LessonEditor
            key={selected}
            lesson={editing}
            onSave={save}
            onCancel={() => handleSelect(rows.length > 0 ? rows[0].documentId : 'new')}
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
