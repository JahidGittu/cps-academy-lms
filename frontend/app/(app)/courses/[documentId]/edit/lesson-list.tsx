import { ArrowDown, ArrowUp, FileText, Plus, Trash2, Video } from 'lucide-react';

import type { Lesson } from '@/lib/types';

const iconFor = (lesson: Lesson) => (lesson.videoUrl ? Video : FileText);

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
  <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-2xs lg:sticky lg:top-20 z-10">
    {/* Syllabus Header */}
    <div className="flex items-center justify-between gap-3 border-b border-subtle px-4 py-3.5 bg-surface">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-sky-500" />
        <h2 className="text-sm font-bold text-primary">Course Syllabus</h2>
      </div>
      <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-xs font-bold text-sky-400">
        {rows.length} {rows.length === 1 ? 'Lesson' : 'Lessons'}
      </span>
    </div>

    {/* Syllabus Items List */}
    {rows.length ? (
      <ul className="p-2 space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto">
        {rows.map((lesson, index) => {
          const Icon = iconFor(lesson);
          const active = selected === lesson.documentId;

          return (
            <li
              key={lesson.documentId}
              className={`group flex items-center justify-between gap-2 rounded-lg p-2.5 transition-all cursor-pointer ${
                active
                  ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/25 ring-1 ring-sky-400/60'
                  : 'border border-theme/60 bg-canvas/60 text-secondary hover:bg-elevated hover:text-primary'
              }`}
              onClick={() => onSelect(lesson.documentId)}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                {/* Number Badge */}
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-extrabold ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-elevated text-muted border border-theme/70'
                  }`}
                >
                  {index + 1}
                </span>

                {/* Lesson Type Icon */}
                <Icon
                  className={`size-4 shrink-0 ${
                    active
                      ? 'text-white'
                      : lesson.videoUrl
                      ? 'text-rose-400'
                      : 'text-sky-400'
                  }`}
                />

                {/* Title */}
                <span
                  className={`truncate text-xs sm:text-sm leading-snug ${
                    active ? 'font-bold text-white' : 'text-primary'
                  }`}
                >
                  {lesson.title}
                </span>
              </div>

              {/* Action Controls with Soft Tag Badge Styling */}
              <div
                className={`flex shrink-0 items-center gap-1 ${
                  active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Up Arrow Tag */}
                <button
                  type="button"
                  title="Move Up in Syllabus"
                  disabled={busy || index === 0}
                  onClick={() => onMove(index, -1)}
                  className={`flex size-6 items-center justify-center rounded-md border text-xs transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer ${
                    active
                      ? 'bg-white/20 hover:bg-white/30 text-white border-white/25 shadow-2xs'
                      : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/20 dark:border-sky-400/20'
                  }`}
                >
                  <ArrowUp className="size-3" />
                </button>

                {/* Down Arrow Tag */}
                <button
                  type="button"
                  title="Move Down in Syllabus"
                  disabled={busy || index === rows.length - 1}
                  onClick={() => onMove(index, 1)}
                  className={`flex size-6 items-center justify-center rounded-md border text-xs transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer ${
                    active
                      ? 'bg-white/20 hover:bg-white/30 text-white border-white/25 shadow-2xs'
                      : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/20 dark:border-sky-400/20'
                  }`}
                >
                  <ArrowDown className="size-3" />
                </button>

                {/* Delete Tag */}
                <button
                  type="button"
                  title="Delete Lesson"
                  disabled={busy}
                  onClick={() => onRemove(lesson)}
                  className={`flex size-6 items-center justify-center rounded-md border text-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-rose-500/30 hover:bg-rose-500 text-white border-rose-300/40 shadow-2xs'
                      : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20 dark:border-rose-400/20'
                  }`}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    ) : (
      <div className="p-6 text-center text-xs text-muted">
        <p className="font-semibold text-primary">No Lessons Yet</p>
        <p className="mt-1">Add your first lesson to start building the curriculum track.</p>
      </div>
    )}

    {/* Add Lesson Button at Bottom */}
    <div className="p-2 border-t border-subtle">
      <button
        type="button"
        onClick={onAdd}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-2.5 text-xs font-bold transition-all cursor-pointer ${
          selected === 'new'
            ? 'border-sky-500/60 bg-sky-500/15 text-sky-400'
            : 'border-theme text-muted hover:border-sky-500/40 hover:bg-elevated hover:text-sky-400'
        }`}
      >
        <Plus className="size-4" />
        <span>Add New Lesson</span>
      </button>
    </div>
  </div>
);
