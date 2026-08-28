'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment, LessonProgress, QuizResult } from '@/lib/types';
import { Alert, Card, Empty, LoadingState, ProgressBar } from '@/components/ui';

interface RowProps {
  course: Course;
  completedLessonIds: Set<number>;
  quizResult?: QuizResult | null;
}

const Row = ({ course, completedLessonIds, quizResult }: RowProps) => {
  const lessons = useMemo(() => {
    return [...(course.lessons ?? [])].sort((a, b) => a.order - b.order);
  }, [course.lessons]);

  const totalLessons = lessons.length;
  const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const percentComplete = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isDone = totalLessons > 0 && completedCount === totalLessons;

  const nextLesson = lessons.find((l) => !completedLessonIds.has(l.id));

  // Determine intelligent target navigation link
  const targetLink = nextLesson
    ? `/lessons/${nextLesson.documentId}`
    : isDone && course.quiz
    ? `/quizzes/${course.quiz.documentId}`
    : `/courses/${course.documentId}`;

  const buttonLabel =
    completedCount === 0
      ? 'Start Lesson'
      : isDone
      ? course.quiz && !quizResult
        ? 'Take Quiz'
        : 'Retake Quiz'
      : 'Continue';

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

          {quizResult && quizResult.score !== undefined && quizResult.total ? (
            <span className="shrink-0 rounded bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
              Quiz: {quizResult.score}/{quizResult.total}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <BookOpen className="size-3.5 text-brand-600" />
            <span>
              {completedCount} of {totalLessons} lessons completed
            </span>
          </span>
          <span className="font-bold text-slate-800">{percentComplete}%</span>
        </div>

        <div className="mt-2">
          <ProgressBar percent={percentComplete} />
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
          href={targetLink}
          className="inline-flex items-center gap-1.5 rounded bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 hover:text-brand-800 transition"
        >
          <span>{buttonLabel}</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </Card>
  );
};

export const EnrolledCourses = () => {
  // Unified O(1) single-level queries eliminating N+1 card waterfalls
  const enrollments = useApi<Collection<Enrollment>>(
    '/enrollments?populate[course][populate]=lessons,quiz'
  );
  const progresses = useApi<Collection<LessonProgress>>('/lesson-progresses?populate=lesson');
  const quizResults = useApi<Collection<QuizResult>>('/quiz-results?populate=quiz&sort=createdAt:desc');

  if (enrollments.loading || progresses.loading || quizResults.loading) {
    return <LoadingState />;
  }

  if (enrollments.error) return <Alert>{enrollments.error}</Alert>;

  const rows = (enrollments.data?.data ?? []).filter((e) => Boolean(e.course));

  const completedSet = new Set(
    (progresses.data?.data ?? [])
      .map((p) => p.lesson?.id)
      .filter((id): id is number => id !== undefined)
  );

  // Map latest quiz results by quiz documentId
  const quizResultMap = new Map<string, QuizResult>();
  for (const qr of quizResults.data?.data ?? []) {
    if (qr.quiz?.documentId && !quizResultMap.has(qr.quiz.documentId)) {
      quizResultMap.set(qr.quiz.documentId, qr);
    }
  }

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
          {rows.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;

            const qr = course.quiz?.documentId
              ? quizResultMap.get(course.quiz.documentId)
              : null;

            return (
              <Row
                key={enrollment.documentId}
                course={course}
                completedLessonIds={completedSet}
                quizResult={qr}
              />
            );
          })}
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
