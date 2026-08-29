import Link from 'next/link';
import { BookOpen, CheckCircle, Award, UserCheck } from 'lucide-react';

import type { Course } from '@/lib/types';
import { Badge } from '@/components/ui';
import { CourseCover } from '@/components/course-cover';

export const CourseTile = ({ course, enrolled = false }: { course: Course; enrolled?: boolean }) => {
  const lessons = course.lessons?.length ?? 0;

  return (
    <Link
      href={`/courses/${course.documentId}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-theme bg-surface shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-active hover:shadow-xl"
    >
      <div className="relative overflow-hidden bg-canvas">
        <CourseCover title={course.title} url={course.coverImageUrl} className="h-44 transition-transform duration-300 group-hover:scale-105" />
        {enrolled && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600/95 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur">
              <CheckCircle className="size-3" />
              <span>Enrolled</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-primary text-base group-hover:text-brand transition-colors line-clamp-1">
          {course.title}
        </h3>

        {course.description && (
          <p className="mt-2 line-clamp-2 text-sm text-secondary leading-relaxed">
            {course.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-subtle flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <BookOpen className="size-3.5 text-brand" />
            <span>{lessons} {lessons === 1 ? 'lesson' : 'lessons'}</span>
          </span>

          {course.quiz ? (
            <Badge tone="brand">
              <Award className="size-3" />
              <span>MCQ Quiz</span>
            </Badge>
          ) : null}
        </div>

        {course.instructor && (
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted font-medium">
            <UserCheck className="size-3.5 text-muted" />
            <span>By {course.instructor}</span>
          </p>
        )}
      </div>
    </Link>
  );
};
