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
      className="group flex h-full flex-col overflow-hidden rounded-md border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
    >
      <div className="relative overflow-hidden">
        <CourseCover title={course.title} url={course.coverImageUrl} className="h-44 transition-transform duration-300 group-hover:scale-105" />
        {enrolled && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded bg-emerald-600/95 px-2 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur">
              <CheckCircle className="size-3" />
              <span>Enrolled</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-slate-900 text-base group-hover:text-brand-600 transition-colors line-clamp-1">
          {course.title}
        </h3>

        {course.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-600 leading-relaxed">
            {course.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <BookOpen className="size-3.5 text-brand-600" />
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
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <UserCheck className="size-3.5 text-slate-400" />
            <span>By {course.instructor}</span>
          </p>
        )}
      </div>
    </Link>
  );
};
