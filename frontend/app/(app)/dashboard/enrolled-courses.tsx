'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, PlayCircle, ClipboardList, Award, Sparkles } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment, LessonProgress, QuizResult } from '@/lib/types';
import { Alert, Empty, ProgressBar } from '@/components/ui';
import { EnrolledCoursesSkeleton } from '@/components/page-skeletons';
import { CourseCover } from '@/components/course-cover';

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
  const completedLessonCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const isLessonsDone = totalLessons > 0 && completedLessonCount === totalLessons;

  // Track milestones includes lessons + quiz if course has one
  const hasQuiz = Boolean(course.quiz);
  const totalMilestones = totalLessons + (hasQuiz ? 1 : 0);
  const completedMilestones = completedLessonCount + (quizResult ? 1 : 0);

  const percentComplete =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const isFullyCompleted =
    isLessonsDone && (!hasQuiz || Boolean(quizResult));

  const nextLesson = lessons.find((l) => !completedLessonIds.has(l.id));

  // Determine intelligent target navigation link
  const targetLink = nextLesson
    ? `/lessons/${nextLesson.documentId}`
    : isLessonsDone && course.quiz && !quizResult
    ? `/quizzes/${course.quiz.documentId}`
    : `/courses/${course.documentId}`;

  const buttonLabel =
    completedLessonCount === 0
      ? 'Start Learning'
      : !isLessonsDone
      ? `Continue (Lesson ${completedLessonCount + 1})`
      : hasQuiz && !quizResult
      ? 'Take Quiz Assessment'
      : 'Review Track';

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl border border-theme bg-surface hover:border-active transition-all duration-200 shadow-sm hover:shadow-md">
      <div>
        {/* Course Cover Thumbnail Banner */}
        <Link href={targetLink} className="block relative overflow-hidden">
          <CourseCover
            title={course.title}
            url={course.coverImageUrl}
            className="h-40 sm:h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Instructor Chip */}
          <div className="absolute top-3 left-3">
            <span className="rounded-md bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/10 shadow-xs">
              {course.instructor ? `By ${course.instructor}` : 'CPS Academy'}
            </span>
          </div>

          {/* Quiz Score Badge or Completion Badge */}
          {quizResult && quizResult.score !== undefined && quizResult.total ? (
            <div className="absolute top-3 right-3">
              <span className="rounded-md bg-purple-600/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-purple-400/30 shadow-xs flex items-center gap-1">
                <Award className="size-3" />
                <span>Quiz: {quizResult.score}/{quizResult.total}</span>
              </span>
            </div>
          ) : isFullyCompleted ? (
            <div className="absolute top-3 right-3">
              <span className="rounded-md bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-emerald-400/30 shadow-xs flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                <span>100% Done</span>
              </span>
            </div>
          ) : isLessonsDone && hasQuiz ? (
            <div className="absolute top-3 right-3">
              <span className="rounded-md bg-amber-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-amber-300/30 shadow-xs flex items-center gap-1">
                <ClipboardList className="size-3" />
                <span>Quiz Ready</span>
              </span>
            </div>
          ) : null}
        </Link>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          <Link
            href={`/courses/${course.documentId}`}
            className="font-bold text-primary hover:text-sky-400 transition-colors text-base line-clamp-1"
          >
            {course.title}
          </Link>

          {course.description && (
            <p className="mt-1.5 text-xs text-muted line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}

          {/* Progress Header & Bar */}
          <div className="mt-4 pt-3 border-t border-theme/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-secondary">
                <BookOpen className="size-3.5 text-sky-400" />
                <span>
                  <strong>{completedLessonCount}</strong> of {totalLessons} lessons {hasQuiz ? `• Quiz ${quizResult ? 'Done' : 'Pending'}` : 'completed'}
                </span>
              </span>
              <span className="font-bold text-primary">{percentComplete}%</span>
            </div>

            <ProgressBar percent={percentComplete} />
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-3">
        <div className="text-xs">
          {isFullyCompleted ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              <span>Track Completed</span>
            </span>
          ) : isLessonsDone && hasQuiz && !quizResult ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-purple-400">
              <span className="size-2 rounded-full bg-purple-400 animate-pulse" />
              <span>Quiz Assessment Ready</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-muted">
              <span className="size-2 rounded-full bg-sky-400 animate-pulse" />
              <span>In Progress</span>
            </span>
          )}
        </div>

        <Link
          href={targetLink}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition shadow-xs ${
            isFullyCompleted
              ? 'border border-theme bg-surface hover:bg-elevated text-secondary hover:text-primary'
              : isLessonsDone && hasQuiz && !quizResult
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
          }`}
        >
          <span>{buttonLabel}</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
};

export const EnrolledCourses = () => {
  // Unified O(1) single-level queries eliminating N+1 card waterfalls
  const enrollments = useApi<Collection<Enrollment>>(
    '/enrollments?populate[course][populate][0]=lessons&populate[course][populate][1]=quiz'
  );
  const progresses = useApi<Collection<LessonProgress>>('/lesson-progresses?populate=lesson');
  const quizResults = useApi<Collection<QuizResult>>('/quiz-results?populate=quiz&sort=createdAt:desc');

  if (enrollments.loading || progresses.loading || quizResults.loading) {
    return <EnrolledCoursesSkeleton />;
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
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="size-5 text-sky-400" />
            <span>My Enrolled Courses</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">Resume your lessons and track overall course completion.</p>
        </div>
        <span className="rounded-lg bg-surface px-3 py-1 text-xs font-bold text-secondary border border-theme shadow-2xs">
          {rows.length} {rows.length === 1 ? 'Track' : 'Tracks'}
        </span>
      </div>

      {rows.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
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
          <p className="text-base font-medium text-primary">No active enrollments yet</p>
          <p className="mt-1 text-sm text-muted">Browse the course catalogue to start learning software engineering tracks.</p>
          <Link href="/courses" className="mt-4 inline-flex items-center gap-1.5 font-bold text-sky-400 hover:underline">
            <span>Explore All Courses</span>
            <ArrowRight className="size-4" />
          </Link>
        </Empty>
      )}
    </section>
  );
};
