'use client';

import Link from 'next/link';

import { useApi } from '@/lib/use-api';
import type { Collection, CourseProgress, Enrollment, Single } from '@/lib/types';
import { Alert, Card, Empty, ProgressBar } from '@/components/ui';

// Each card asks the server for its own numbers rather than one request bringing back every lesson
// and every completion for this page to count up. It is a request per course, but the percentage a
// student reads here is then the same figure their instructor reads on the roster, out of the same
// code, instead of a second count that can disagree with it.
const Row = ({ enrollment }: { enrollment: Enrollment }) => {
  const course = enrollment.course;

  const progress = useApi<Single<CourseProgress>>(
    course ? `/courses/${course.documentId}/progress` : null
  );

  if (!course) return null;

  const summary = progress.data?.data;
  const mine = summary?.students[0];

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <Link href={`/courses/${course.documentId}`} className="font-medium hover:underline">
          {course.title}
        </Link>

        {mine?.quizTotal ? (
          <span className="shrink-0 text-sm text-slate-500">
            Quiz {mine.quizScore} / {mine.quizTotal}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-slate-600">
        {mine?.completedLessons ?? 0} of {summary?.totalLessons ?? 0} lessons done
      </p>

      <div className="mt-2">
        <ProgressBar percent={mine?.percentComplete ?? 0} />
      </div>
    </Card>
  );
};

export const EnrolledCourses = () => {
  const enrollments = useApi<Collection<Enrollment>>('/enrollments?populate=course');

  if (enrollments.loading) return <p className="text-sm text-slate-500">Loading your courses</p>;

  if (enrollments.error) return <Alert>{enrollments.error}</Alert>;

  const rows = enrollments.data?.data ?? [];

  return (
    <section>
      <h2 className="mb-3 text-lg font-medium">My courses</h2>

      {rows.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((enrollment) => (
            <Row key={enrollment.documentId} enrollment={enrollment} />
          ))}
        </div>
      ) : (
        <Empty>
          Nothing enrolled yet.{' '}
          <Link href="/courses" className="underline">
            Browse the courses
          </Link>
          .
        </Empty>
      )}
    </section>
  );
};
