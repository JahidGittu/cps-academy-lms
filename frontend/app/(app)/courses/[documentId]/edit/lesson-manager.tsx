'use client';

import { useState, useEffect, useRef } from 'react';
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
  onNext,
}: {
  course: string;
  onChanged: () => Promise<void>;
  onNext?: () => void;
}) => {
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get('lesson');

  const lessons = useApi<Collection<Lesson>>(
    `/lessons?filters[course][documentId][$eq]=${course}&sort=order:asc`
  );

  // Keep local ordered list for instant optimistic rendering without UI jumping
  const [localLessons, setLocalLessons] = useState<Lesson[]>([]);
  // What the panel on the right is holding: a documentId, the word 'new', or empty
  const [selected, setSelected] = useState<string>(lessonParam || 'new');
  const [busy, setBusy] = useState(false);
  const [reorderStatus, setReorderStatus] = useState<'saving' | 'saved' | null>(null);
  const [actionError, setActionError] = useState('');
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const hasInitializedRef = useRef(false);
  const reorderTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize server lessons into local state:
  useEffect(() => {
    if (lessons.data?.data) {
      const sorted = [...lessons.data.data].sort((a, b) => a.order - b.order);
      setLocalLessons(sorted);

      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        if (lessonParam && sorted.some((l) => l.documentId === lessonParam)) {
          setSelected(lessonParam);
        } else if (sorted.length > 0) {
          setSelected(sorted[0].documentId);
        } else {
          setSelected('new');
        }
      }
    }
  }, [lessons.data, lessonParam]);

  const handleSelect = (id: string) => {
    setSelected(id);
    const url = `/courses/${course}/edit?tab=lessons${id === 'new' ? '' : `&lesson=${id}`}`;
    window.history.replaceState(null, '', url);
  };

  const rows = localLessons;
  const editing = rows.find((row) => row.documentId === selected) ?? null;

  const videoLessonsCount = rows.filter((r) => Boolean(r.videoUrl?.trim())).length;
  const readingMaterialsCount = rows.filter((r) => Boolean(r.content?.trim())).length;

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
      lessons.reload();
      onChanged();
      return;
    }

    // Students read the syllabus in this order, so a new lesson goes on the end
    const order = rows.length ? Math.max(...rows.map((row) => row.order)) + 1 : 1;
    const { data } = await api.post<Single<Lesson>>('/lessons', {
      data: { ...values, order, course },
    });

    // Optimistically add the new lesson into local state
    const createdLesson = data.data;
    setLocalLessons((prev) => [...prev, createdLesson]);
    handleSelect(createdLesson.documentId);

    // Background sync
    lessons.reload();
    onChanged();
  };

  // Truly instant optimistic reorder with zero-buffering background auto-save
  const move = async (index: number, delta: number) => {
    if (index + delta < 0 || index + delta >= rows.length) return;

    if (reorderTimerRef.current) {
      clearTimeout(reorderTimerRef.current);
    }

    setReorderStatus('saving');

    // 1. Instant local array splice and clean sequential order (1, 2, 3...)
    const reordered = [...rows];
    const [movedLesson] = reordered.splice(index, 1);
    reordered.splice(index + delta, 0, movedLesson);

    const indexedLessons = reordered.map((lesson, idx) => ({
      ...lesson,
      order: idx + 1,
    }));

    setLocalLessons(indexedLessons);

    // 2. Auto-save the updated orders directly to Strapi database in background
    try {
      await Promise.all(
        indexedLessons.map((l) =>
          api.put(`/lessons/${l.documentId}`, { data: { order: l.order } })
        )
      );
      setReorderStatus('saved');
      reorderTimerRef.current = setTimeout(() => {
        setReorderStatus(null);
      }, 2500);
      onChanged();
    } catch (caught) {
      setActionError(errorMessage(caught));
      setReorderStatus(null);
      await lessons.reload();
    }
  };

  // Delete lesson confirmation with optimistic removal
  const confirmDeleteLesson = () => {
    if (!lessonToDelete) return;
    const lesson = lessonToDelete;

    run(async () => {
      const remaining = rows.filter((r) => r.documentId !== lesson.documentId);
      setLocalLessons(remaining);
      if (selected === lesson.documentId) {
        handleSelect(remaining.length > 0 ? remaining[0].documentId : 'new');
      }

      await api.delete(`/lessons/${lesson.documentId}`);
      lessons.reload();
      onChanged();
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

        <div className="flex items-center gap-2">
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-400 px-4 py-2.5 text-xs font-bold hover:bg-sky-500/20 cursor-pointer transition-all"
            >
              Next: Quiz →
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSelect('new')}
            className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-sky-600/25 hover:shadow-sky-500/35 cursor-pointer transition-all"
          >
            <Plus className="size-4" />
            <span>Add New Lesson</span>
          </button>
        </div>
      </div>

      <Alert>{actionError}</Alert>

      {/* Split Grid: Syllabus Tree on Left (360px) and Editor on Right */}
      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <LessonList
          rows={rows}
          selected={selected}
          busy={busy}
          reorderStatus={reorderStatus}
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
