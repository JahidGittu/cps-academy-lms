import Link from 'next/link';
import { ArrowLeft, Eye, Users } from 'lucide-react';

import type { Course } from '@/lib/types';
import { buttonStyle } from '@/components/ui';

// Sticky under the site header
export const BuilderHeader = ({ course }: { course: Course }) => (
  <div className="sticky top-16 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-theme bg-surface/90 px-4 py-3 shadow-sm backdrop-blur">
    <Link
      href="/dashboard"
      title="Back to dashboard"
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-theme text-muted transition hover:bg-elevated hover:text-primary"
    >
      <ArrowLeft className="size-4" />
    </Link>

    <div className="mr-auto min-w-0">
      <h1 className="truncate font-semibold text-primary">{course.title}</h1>

      <p className="text-xs text-muted">
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
