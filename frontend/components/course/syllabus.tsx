import Link from 'next/link';
import { Check, Lock, Play } from 'lucide-react';

import type { Lesson } from '@/lib/types';
import { Empty } from '@/components/ui';

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
    <ol className="divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200/90 bg-white shadow-2xs">
      {lessons.map((lesson, index) => {
        const finished = done(lesson.documentId);
        const reachable = open(index);

        return (
          <li
            key={lesson.documentId}
            className={`flex items-center gap-3.5 px-4 py-3.5 text-xs sm:text-sm transition-colors ${
              reachable ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50'
            }`}
          >
            {/* Status Number / Check Indicator */}
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                finished
                  ? 'bg-emerald-100 text-emerald-700'
                  : reachable
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {finished ? <Check className="size-3.5 stroke-[3]" /> : index + 1}
            </span>

            {/* Lesson Title & Link */}
            {reachable ? (
              <Link
                href={`/lessons/${lesson.documentId}`}
                className="flex-1 font-semibold text-slate-900 hover:text-brand-600 transition-colors flex items-center justify-between gap-2 group"
              >
                <span className="truncate">{lesson.title}</span>
                <span className="text-xs font-bold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Open Lesson →
                </span>
              </Link>
            ) : (
              <div className="flex-1 flex items-center justify-between gap-2 text-slate-400">
                <span className="truncate font-medium">{lesson.title}</span>

                {/* Locked Tooltip Badge */}
                <span
                  title="Sequential lock: Complete previous lessons to unlock this lesson."
                  className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200 cursor-help"
                >
                  <Lock className="size-3 text-slate-400" />
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
