import Link from 'next/link';
import { ChevronRight, ClipboardList, ListOrdered, UserRound } from 'lucide-react';

import type { Course } from '@/lib/types';

export const DetailHeader = ({ course, lessons }: { course: Course; lessons: number }) => (
  <div className="relative overflow-hidden rounded-xl bg-slate-900 px-6 py-8 sm:px-10 sm:py-10 border border-slate-800 shadow-md">
    <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand-600/20 blur-2xl" />

    <div className="relative">
      <nav className="flex items-center gap-1 text-xs text-slate-400">
        <Link href="/courses" className="hover:text-white transition-colors">
          Courses
        </Link>
        <ChevronRight className="size-3" />
        <span className="truncate text-slate-300">{course.title}</span>
      </nav>

      <h1 className="mt-3 max-w-2xl text-2xl sm:text-3xl font-bold tracking-tight text-white">
        {course.title}
      </h1>

      {course.description && (
        <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">{course.description}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <ListOrdered className="size-3.5 text-brand-400" />
          {lessons} {lessons === 1 ? 'lesson' : 'lessons'}
        </span>

        {course.quiz && (
          <span className="flex items-center gap-1.5 font-medium">
            <ClipboardList className="size-3.5 text-violet-400" />
            Ends with a quiz
          </span>
        )}

        {course.instructor && (
          <span className="flex items-center gap-1.5 font-medium">
            <UserRound className="size-3.5 text-sky-400" />
            Taught by <span className="text-slate-200 font-semibold">{course.instructor}</span>
          </span>
        )}
      </div>
    </div>
  </div>
);
