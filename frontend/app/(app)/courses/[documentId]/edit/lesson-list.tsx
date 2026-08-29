import { ChevronDown, ChevronUp, FileText, Plus, Trash2, Video } from 'lucide-react';

import type { Lesson } from '@/lib/types';

// Same split the lesson viewer makes, so the icon here is a fair preview of what a student opens.
const iconFor = (lesson: Lesson) => (lesson.videoUrl ? Video : FileText);

const action =
  'rounded p-1 text-muted transition hover:bg-elevated hover:text-primary disabled:opacity-30';

export const LessonList = ({
  rows,
  selected,
  busy,
  onSelect,
  onAdd,
  onMove,
  onRemove,
}: {
  rows: Lesson[];
  selected: string;
  busy: boolean;
  onSelect: (documentId: string) => void;
  onAdd: () => void;
  onMove: (index: number, delta: number) => void;
  onRemove: (lesson: Lesson) => void;
}) => (
  <div className="overflow-hidden rounded-lg border border-theme bg-surface shadow-2xs lg:sticky lg:top-20 z-10 max-h-[calc(100vh-6rem)] overflow-y-auto">
    <div className="flex items-baseline justify-between gap-3 border-b border-subtle px-4 py-3 bg-surface sticky top-0 z-10">
      <h2 className="text-sm font-bold text-primary">Syllabus</h2>
      <span className="text-xs font-semibold text-muted">{rows.length} lessons</span>
    </div>

    {rows.length ? (
      <ul className="divide-y divide-subtle">
        {rows.map((lesson, index) => {
          const Icon = iconFor(lesson);
          const active = selected === lesson.documentId;

          return (
            <li
              key={lesson.documentId}
              className={`group flex items-center gap-1 border-l-2 pr-2 text-sm transition ${
                active ? 'border-brand-600 bg-brand-subtle font-bold' : 'border-transparent hover:bg-elevated'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(lesson.documentId)}
                className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5 pl-3 text-left cursor-pointer"
              >
                <span className="w-4 shrink-0 text-xs text-muted font-bold">{index + 1}</span>

                <Icon className={`size-4 shrink-0 ${active ? 'text-brand' : 'text-muted'}`} />

                <span className={`truncate text-xs sm:text-sm ${active ? 'font-bold text-brand' : 'text-primary'}`}>
                  {lesson.title}
                </span>
              </button>

              {/* Dim until the row is hovered */}
              <span className="flex shrink-0 items-center opacity-60 transition group-hover:opacity-100">
                <button
                  type="button"
                  title="Move up"
                  disabled={busy || index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(index, -1);
                  }}
                  className={action}
                >
                  <ChevronUp className="size-4" />
                </button>

                <button
                  type="button"
                  title="Move down"
                  disabled={busy || index === rows.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(index, 1);
                  }}
                  className={action}
                >
                  <ChevronDown className="size-4" />
                </button>

                <button
                  type="button"
                  title="Delete lesson"
                  disabled={busy}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(lesson);
                  }}
                  className={`${action} hover:text-red-500`}
                >
                  <Trash2 className="size-4" />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="px-4 py-10 text-center text-sm text-muted">
        No lessons yet. The first one you add is the one students start on.
      </p>
    )}

    <button
      type="button"
      onClick={onAdd}
      className={`flex w-full items-center justify-center gap-2 border-t border-dashed border-theme py-3 text-sm font-medium transition hover:bg-elevated cursor-pointer ${
        selected === 'new' ? 'text-brand font-bold' : 'text-muted hover:text-brand'
      }`}
    >
      <Plus className="size-4" />
      Add a lesson
    </button>
  </div>
);
