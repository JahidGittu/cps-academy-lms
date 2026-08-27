'use client';

import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment } from '@/lib/types';
import { Alert, Empty } from '@/components/ui';
import { CourseTile } from '@/components/course-tile';

const Catalogue = () => {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  const courses = useApi<Collection<Course>>('/courses');

  // Only a Student has enrollments of their own to compare against; the other roles would get
  // every enrollment on the platform back, which says nothing about this list.
  const enrollments = useApi<Collection<Enrollment>>(
    isStudent ? '/enrollments?populate=course' : null
  );

  const enrolledIn = new Set((enrollments.data?.data ?? []).map((row) => row.course?.documentId));

  if (courses.loading) return <p className="text-sm text-slate-500">Loading courses</p>;

  if (courses.error) return <Alert>{courses.error}</Alert>;

  const rows = courses.data?.data ?? [];

  if (!rows.length) return <Empty>No courses yet.</Empty>;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((course) => (
        <CourseTile
          key={course.documentId}
          course={course}
          enrolled={enrolledIn.has(course.documentId)}
        />
      ))}
    </div>
  );
};

export default function CoursesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Courses</h1>

      <p className="mt-2 mb-6 text-sm text-slate-600">
        Every syllabus is open to read. Enrolling is what opens the lesson bodies and the quiz.
      </p>

      {/* No sign in wrapper. The catalogue is the one screen a visitor is sent to from the front
          page, and course reads are granted to the Public role for exactly that. */}
      <Catalogue />
    </div>
  );
}
