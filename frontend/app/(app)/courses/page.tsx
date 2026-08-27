'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment } from '@/lib/types';
import { Alert, Card, Empty } from '@/components/ui';

const lessonCount = (course: Course) => {
  const count = course.lessons?.length ?? 0;

  return `${count} ${count === 1 ? 'lesson' : 'lessons'}`;
};

const Catalogue = () => {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  const courses = useApi<Collection<Course>>('/courses');

  // Only a Student has enrollments of their own to compare against; the other roles would get
  // every enrollment on the platform back, which says nothing about this list.
  const enrollments = useApi<Collection<Enrollment>>(
    isStudent ? '/enrollments?populate=course' : null
  );

  const enrolledIn = new Set(
    (enrollments.data?.data ?? []).map((row) => row.course?.documentId)
  );

  if (courses.loading) return <p className="text-sm text-slate-500">Loading courses</p>;

  if (courses.error) return <Alert>{courses.error}</Alert>;

  const rows = courses.data?.data ?? [];

  if (!rows.length) return <Empty>No courses yet.</Empty>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((course) => (
        <Link key={course.documentId} href={`/courses/${course.documentId}`} className="block">
          <Card className="h-full hover:border-slate-400">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-medium">{course.title}</h2>

              {enrolledIn.has(course.documentId) && (
                <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  Enrolled
                </span>
              )}
            </div>

            {course.description && (
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.description}</p>
            )}

            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <BookOpen className="size-3.5" />
              {lessonCount(course)}
              {course.quiz && ' and a quiz'}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default function CoursesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Courses</h1>

      {/* No sign in wrapper. The catalogue is the one screen a visitor is sent to from the front
          page, and course reads are granted to the Public role for exactly that. */}
      <Catalogue />
    </div>
  );
}
