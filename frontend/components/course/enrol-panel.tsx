import { ClipboardList, ListOrdered, LineChart } from 'lucide-react';

import type { Course } from '@/lib/types';
import { CourseCover } from '@/components/course-cover';

export const EnrolPanel = ({
  course,
  lessons,
  children,
}: {
  course: Course;
  lessons: number;
  children: React.ReactNode;
}) => (
  <div className="overflow-hidden rounded-md border border-slate-200/90 bg-white shadow-md">
    <CourseCover title={course.title} url={course.coverImageUrl} className="h-44" />

    <div className="p-5 space-y-4">
      <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
        <li className="flex items-center gap-2.5">
          <ListOrdered className="size-4 shrink-0 text-brand-600" />
          <span>{lessons} {lessons === 1 ? 'lesson' : 'lessons'}, sequential unlock</span>
        </li>

        {course.quiz && (
          <li className="flex items-center gap-2.5">
            <ClipboardList className="size-4 shrink-0 text-violet-600" />
            <span className="truncate">{course.quiz.title}</span>
          </li>
        )}

        <li className="flex items-center gap-2.5">
          <LineChart className="size-4 shrink-0 text-emerald-600" />
          <span>Automated progress tracking</span>
        </li>
      </ul>

      <div className="border-t border-slate-100 pt-4">{children}</div>
    </div>
  </div>
);
