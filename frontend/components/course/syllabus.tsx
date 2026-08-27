import Link from 'next/link';
import { Check, Lock } from 'lucide-react';

import type { Lesson } from '@/lib/types';
import { Empty } from '@/components/ui';

// The syllabus, and the same list for everybody looking at it. Which rows are links is the page's
// decision, because that depends on the enrollment and on who owns the course.
export const Syllabus = ({
  lessons,
  done,
  open,
}: {
  lessons: Lesson[];
  done: (documentId: string) => boolean;
  open: (index: number) => boolean;
}) => {
  if (!lessons.length) return <Empty>No lessons yet.</Empty>;

  return (
    <ol className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {lessons.map((lesson, index) => {
        const finished = done(lesson.documentId);
        const reachable = open(index);

        return (
          <li key={lesson.documentId} className="flex items-center gap-3 px-4 py-3 text-sm">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                finished ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {finished ? <Check className="size-3.5" /> : index + 1}
            </span>

            {reachable ? (
              <Link
                href={`/lessons/${lesson.documentId}`}
                className="flex-1 font-medium text-slate-900 hover:text-brand-700"
              >
                {lesson.title}
              </Link>
            ) : (
              <span className="flex-1 text-slate-500">{lesson.title}</span>
            )}

            {!reachable && !finished && <Lock className="size-3.5 shrink-0 text-slate-300" />}
          </li>
        );
      })}
    </ol>
  );
};
