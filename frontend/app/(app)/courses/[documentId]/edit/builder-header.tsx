import Link from 'next/link';
import { ArrowLeft, Eye, Users } from 'lucide-react';

import type { Course } from '@/lib/types';
import { buttonStyle } from '@/components/ui';

// Sticky under the site header, because a lesson body is tall enough that by the time you are at the
// bottom of one, the course title and the way out are a long scroll away.
export const BuilderHeader = ({ course }: { course: Course }) => (
  <div className="sticky top-16 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
    <Link
      href="/dashboard"
      title="Back to dashboard"
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
    >
      <ArrowLeft className="size-4" />
    </Link>

    <div className="mr-auto min-w-0">
      <h1 className="truncate font-semibold">{course.title}</h1>

      <p className="text-xs text-slate-500">
        {course.lessons?.length ?? 0} lessons, {course.quiz ? 'quiz added' : 'no quiz yet'}
      </p>
    </div>

    <Link href={`/courses/${course.documentId}/students`} className={buttonStyle('plain')}>
      <Users className="size-4" />
      Students
    </Link>

    <Link href={`/courses/${course.documentId}`} className={buttonStyle('plain')}>
      <Eye className="size-4" />
      View
    </Link>
  </div>
);
