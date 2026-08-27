'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Collection, CourseProgress, Enrollment, Single } from '@/lib/types';
import { Alert, Card, Empty, LoadingState, ProgressBar } from '@/components/ui';

const Row = ({ enrollment }: { enrollment: Enrollment }) => {
  const course = enrollment.course;

  const progress = useApi<Single<CourseProgress>>(
    course ? `/courses/${course.documentId}/progress` : null
  );

  if (!course) return null;

  const summary = progress.data?.data;
  const mine = summary?.students[0];
  const isDone = (mine?.percentComplete ?? 0) === 100;

  return (
    <Card hover className="flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link 
            href={`/courses/${course.documentId}`} 
            className="font-semibold text-slate-900 hover:text-brand-600 transition-colors text-base"
          >
            {course.title}
          </Link>

          {mine?.quizTotal ? (
            <span className="shrink-0 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
              Quiz: {mine.quizScore}/{mine.quizTotal}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <BookOpen className="size-3.5 text-brand-600" />
            <span>{mine?.completedLessons ?? 0} of {summary?.totalLessons ?? 0} lessons completed</span>
          </span>
          <span className="font-bold text-slate-800">{mine?.percentComplete ?? 0}%</span>
        </div>

        <div className="mt-2">
          <ProgressBar percent={mine?.percentComplete ?? 0} />
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        {isDone ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="size-3.5" />
            <span>All Lessons Completed</span>
          </span>
        ) : (
          <span className="text-xs text-slate-500 font-medium">In Progress</span>
        )}

        <Link
          href={`/courses/${course.documentId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <span>Continue</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </Card>
  );
};

export const EnrolledCourses = () => {
  const enrollments = useApi<Collection<Enrollment>>('/enrollments?populate=course');

  if (enrollments.loading) {
    return (
      <LoadingState
        message="Loading your enrolled courses..."
        subtext="Syncing your sequential lesson progression and quiz scores."
      />
    );
  }

  if (enrollments.error) return <Alert>{enrollments.error}</Alert>;

  const rows = enrollments.data?.data ?? [];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Enrolled Courses</h2>
          <p className="text-sm text-slate-500">Resume your lessons and track overall course completion.</p>
        </div>
        <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
          {rows.length} {rows.length === 1 ? 'course' : 'courses'}
        </span>
      </div>

      {rows.length ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {rows.map((enrollment) => (
            <Row key={enrollment.documentId} enrollment={enrollment} />
          ))}
        </div>
      ) : (
        <Empty>
          <p className="text-base font-medium text-slate-700">No active enrollments</p>
          <p className="mt-1 text-sm text-slate-500">Browse the course catalogue to start learning.</p>
          <Link href="/courses" className="mt-4 inline-block font-semibold text-brand-600 hover:underline">
            Explore Courses →
          </Link>
        </Empty>
      )}
    </section>
  );
};
