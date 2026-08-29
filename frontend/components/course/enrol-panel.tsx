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
  <div className="overflow-hidden rounded-lg border border-theme bg-surface shadow-md">
    <CourseCover title={course.title} url={course.coverImageUrl} className="h-44" />

    <div className="p-5 space-y-4">
      <ul className="space-y-2.5 text-xs sm:text-sm text-secondary font-medium">
        <li className="flex items-center gap-2.5">
          <ListOrdered className="size-4 shrink-0 text-brand" />
          <span>{lessons} Structured {lessons === 1 ? 'Lesson' : 'Lessons'}</span>
        </li>

        {course.quiz && (
          <li className="flex items-center gap-2.5">
            <ClipboardList className="size-4 shrink-0 text-purple-500" />
            <span className="truncate">{course.quiz.title}</span>
          </li>
        )}

        <li className="flex items-center gap-2.5">
          <LineChart className="size-4 shrink-0 text-emerald-500" />
          <span>Automated progress tracking</span>
        </li>
      </ul>

      <div className="border-t border-subtle pt-4">{children}</div>
    </div>
  </div>
);
