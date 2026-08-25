'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Collection, Course } from '@/lib/types';
import { Alert, buttonStyle, Card, Empty } from '@/components/ui';

// mine=true is the course controller's flag for "courses this account may change". An instructor
// gets the ones they own; the two roles that run the whole library get all of them, which is what a
// manage screen should be listing for them.
export const ManagedCourses = () => {
  const courses = useApi<Collection<Course>>('/courses?mine=true');

  if (courses.loading) return <p className="text-sm text-slate-500">Loading courses</p>;

  if (courses.error) return <Alert>{courses.error}</Alert>;

  const rows = courses.data?.data ?? [];

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium">Courses you run</h2>

        <Link href="/courses/new" className={buttonStyle()}>
          New course
        </Link>
      </div>

      {rows.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((course) => (
            <Card key={course.documentId}>
              <div className="flex items-start justify-between gap-3">
                <Link href={`/courses/${course.documentId}`} className="font-medium hover:underline">
                  {course.title}
                </Link>

                <Link
                  href={`/courses/${course.documentId}/edit`}
                  className="shrink-0 text-xs text-slate-500 underline hover:text-slate-900"
                >
                  Edit
                </Link>
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <BookOpen className="size-3.5" />
                {course.lessons?.length ?? 0} lessons
                {course.quiz && ' and a quiz'}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>No courses under your name yet.</Empty>
      )}
    </section>
  );
};
