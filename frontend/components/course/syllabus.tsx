import Link from 'next/link';
import { Check, Lock, Pencil } from 'lucide-react';

import type { Lesson } from '@/lib/types';
import { Empty } from '@/components/ui';

export const Syllabus = ({
  lessons,
  done,
  open,
  isAuthor = false,
  courseDocId,
}: {
  lessons: Lesson[];
  done: (documentId: string) => boolean;
  open: (index: number) => boolean;
  isAuthor?: boolean;
  courseDocId?: string;
}) => {
  if (!lessons.length) return <Empty>No lessons yet.</Empty>;

  return (
    <ol className="divide-y divide-subtle overflow-hidden rounded-lg border border-theme bg-surface shadow-2xs">
      {lessons.map((lesson, index) => {
        const finished = done(lesson.documentId);
        const reachable = open(index);

        return (
          <li
            key={lesson.documentId}
            className={`flex items-center gap-3.5 px-4 py-3.5 text-xs sm:text-sm transition-colors ${
              reachable || isAuthor ? 'bg-surface hover:bg-elevated' : 'bg-canvas opacity-75'
            }`}
          >
            {/* Status Number / Check Indicator */}
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                finished
                  ? 'badge-green'
                  : reachable || isAuthor
                  ? 'bg-brand-subtle text-brand'
                  : 'bg-elevated text-muted'
              }`}
            >
              {finished ? <Check className="size-3.5 stroke-[3]" /> : index + 1}
            </span>

            {/* If Author/Admin -> Edit Lesson */}
            {isAuthor && courseDocId ? (
              <Link
                href={`/courses/${courseDocId}/edit?tab=lessons&lesson=${lesson.documentId}`}
                className="flex-1 font-semibold text-primary hover:text-sky-400 transition-colors flex items-center justify-between gap-2 group"
              >
                <span className="truncate">{lesson.title}</span>
                <span className="text-xs font-bold text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1">
                  <Pencil className="size-3" />
                  <span>Edit Lesson &rarr;</span>
                </span>
              </Link>
            ) : reachable ? (
              /* If Enrolled Student -> Open Lesson */
              <Link
                href={`/lessons/${lesson.documentId}`}
                className="flex-1 font-semibold text-primary hover:text-sky-400 transition-colors flex items-center justify-between gap-2 group"
              >
                <span className="truncate">{lesson.title}</span>
                <span className="text-xs font-bold text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Open Lesson &rarr;
                </span>
              </Link>
            ) : (
              /* If Visitor / Unenrolled / Locked */
              <div className="flex-1 flex items-center justify-between gap-2 text-muted">
                <span className="truncate font-medium">{lesson.title}</span>

                {/* Locked Tooltip Badge */}
                <span
                  title="Enroll in this course to start learning"
                  className="inline-flex items-center gap-1 rounded bg-elevated px-2 py-0.5 text-[11px] font-semibold text-muted border border-theme cursor-help"
                >
                  <Lock className="size-3 text-muted" />
                  <span>Locked</span>
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
};
