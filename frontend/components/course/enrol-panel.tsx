import { ClipboardList, ListOrdered, LineChart } from 'lucide-react';

import type { Course } from '@/lib/types';
import { CourseCover } from '@/components/course-cover';

// The card down the right of a course page: the cover, what is inside the course, and one action
// underneath. Which action that is depends on who is looking, so the page passes it in as children.
export const EnrolPanel = ({
  course,
  lessons,
  children,
}: {
  course: Course;
  lessons: number;
  children: React.ReactNode;
}) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <CourseCover title={course.title} url={course.coverImageUrl} className="h-40" />

    <div className="p-5">
      <ul className="space-y-2.5 text-sm text-slate-600">
        <li className="flex items-center gap-2.5">
          <ListOrdered className="size-4 shrink-0 text-brand-600" />
          {lessons} {lessons === 1 ? 'lesson' : 'lessons'}, opened in order
        </li>

        {course.quiz && (
          <li className="flex items-center gap-2.5">
            <ClipboardList className="size-4 shrink-0 text-brand-600" />
            {course.quiz.title}
          </li>
        )}

        <li className="flex items-center gap-2.5">
          <LineChart className="size-4 shrink-0 text-brand-600" />
          Progress kept as you go
        </li>
      </ul>

      <div className="mt-5 border-t border-slate-100 pt-5">{children}</div>
    </div>
  </div>
);
