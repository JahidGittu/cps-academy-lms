import Link from 'next/link';
import { ChevronRight, ClipboardList, ListOrdered, UserRound } from 'lucide-react';

import type { Course } from '@/lib/types';

// The band across the top of a course page. Dark, because everything under it is white cards and the
// page needs somewhere for the eye to land first.
export const DetailHeader = ({ course, lessons }: { course: Course; lessons: number }) => (
  <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-8 sm:px-10 sm:py-12">
    <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand-600/20 blur-2xl" />

    <div className="relative">
      <nav className="flex items-center gap-1 text-sm text-slate-400">
        <Link href="/courses" className="hover:text-white">
          Courses
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-slate-300">{course.title}</span>
      </nav>

      <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white">
        {course.title}
      </h1>

      {course.description && (
        <p className="mt-3 max-w-2xl text-slate-300">{course.description}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
        <span className="flex items-center gap-1.5">
          <ListOrdered className="size-4" />
          {lessons} {lessons === 1 ? 'lesson' : 'lessons'}
        </span>

        {course.quiz && (
          <span className="flex items-center gap-1.5">
            <ClipboardList className="size-4" />
            Ends with a quiz
          </span>
        )}

        {course.instructor && (
          <span className="flex items-center gap-1.5">
            <UserRound className="size-4" />
            Taught by <span className="text-slate-200">{course.instructor}</span>
          </span>
        )}
      </div>
    </div>
  </div>
);
