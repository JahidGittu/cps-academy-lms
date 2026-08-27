import Link from 'next/link';
import { BookOpen, Check } from 'lucide-react';

import type { Course } from '@/lib/types';
import { Badge } from '@/components/ui';
import { CourseCover } from '@/components/course-cover';

// One tile for both lists that show courses: the six on the front page and the whole catalogue. The
// enrolled badge is the only thing that differs between them, and only a student ever sees it.
export const CourseTile = ({ course, enrolled = false }: { course: Course; enrolled?: boolean }) => {
  const lessons = course.lessons?.length ?? 0;

  return (
    <Link
      href={`/courses/${course.documentId}`}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <CourseCover title={course.title} url={course.coverImageUrl} className="h-36" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium">{course.title}</h3>

          {enrolled && (
            <Badge tone="green">
              <Check className="size-3" />
              Enrolled
            </Badge>
          )}
        </div>

        {course.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-3.5" />
            {lessons} {lessons === 1 ? 'lesson' : 'lessons'}
          </span>

          {course.quiz && <Badge tone="brand">Ends with a quiz</Badge>}
        </div>

        {course.instructor && (
          <p className="mt-3 text-xs text-slate-400">Taught by {course.instructor}</p>
        )}
      </div>
    </Link>
  );
};
