'use client';

import { useParams } from 'next/navigation';
import { Users, Award, CheckCircle2, TrendingUp } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Course, CourseProgress, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Empty, LoadingState, ProgressBar } from '@/components/ui';
import { useSetBreadcrumbs } from '@/components/dashboard-shell';

const Roster = ({ documentId }: { documentId: string }) => {
  const course = useApi<Single<Course>>(`/courses/${documentId}`);
  const progress = useApi<Single<CourseProgress>>(`/courses/${documentId}/progress`);

  const detail = course.data?.data;

  useSetBreadcrumbs(
    detail
      ? [
          { label: 'Courses', href: '/admin/course-management' },
          { label: detail.title },
          { label: 'Student Progress' },
        ]
      : [{ label: 'Courses', href: '/admin/course-management' }, { label: 'Student Progress' }]
  );

  if ((course.loading && !course.data) || (progress.loading && !progress.data)) {
    return <LoadingState />;
  }

  if (!detail) return <Empty>This course does not exist.</Empty>;

  if (!detail.owned) return <Empty>This course belongs to someone else.</Empty>;

  if (progress.error) return <Alert>{progress.error}</Alert>;

  const summary = progress.data?.data;
  const rows = summary?.students ?? [];

  const avgProgress = rows.length
    ? Math.round(rows.reduce((acc, curr) => acc + curr.percentComplete, 0) / rows.length)
    : 0;

  const quizTakers = rows.filter((r) => Boolean(r.quizTotal && r.quizTotal > 0));

  return (
    <div className="space-y-6">
      {/* Top Header & Analytics Summary Cards */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            Student Progress Roster
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Real-time syllabus completion rates and quiz assessment performance for <strong className="text-primary">{detail.title}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-theme bg-surface p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-brand-subtle text-brand border border-brand-border">
                <Users className="size-4" />
              </span>
              <div>
                <p className="text-xs text-muted font-medium">Total Enrolled</p>
                <p className="text-xl font-bold text-primary">{rows.length} {rows.length === 1 ? 'Student' : 'Students'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-theme bg-surface p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <TrendingUp className="size-4" />
              </span>
              <div>
                <p className="text-xs text-muted font-medium">Average Progress</p>
                <p className="text-xl font-bold text-primary">{avgProgress}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-theme bg-surface p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Award className="size-4" />
              </span>
              <div>
                <p className="text-xs text-muted font-medium">Quiz Attempts</p>
                <p className="text-xl font-bold text-primary">{quizTakers.length} of {rows.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Roster Table */}
      {rows.length ? (
        <div className="overflow-hidden rounded-lg border border-theme bg-surface shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-theme bg-surface text-primary text-[11px] font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Student Learner</th>
                  <th className="px-5 py-3.5">Lessons Done</th>
                  <th className="w-56 px-5 py-3.5">Completion Rate</th>
                  <th className="px-5 py-3.5 text-right">Quiz Assessment</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-subtle">
                {rows.map((student) => {
                  const hasQuiz = Boolean(student.quizTotal && student.quizTotal > 0);
                  const quizScore = student.quizScore ?? 0;
                  const quizTotal = student.quizTotal ?? 0;
                  const quizScorePercent = hasQuiz && quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;
                  const isPassed = quizScorePercent >= 70;

                  return (
                    <tr key={student.id} className="hover:bg-elevated/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-[11px] font-bold text-brand uppercase border border-brand-border">
                            {student.username.slice(0, 2)}
                          </span>
                          <div>
                            <span className="font-bold text-primary block">{student.username}</span>
                            <span className="text-[11px] text-muted font-normal">Student Learner</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-secondary">
                        {student.completedLessons} of {summary?.totalLessons ?? 0}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1">
                            <ProgressBar percent={student.percentComplete} />
                          </div>
                          <span className="w-9 shrink-0 text-right text-xs font-bold text-primary">
                            {student.percentComplete}%
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {hasQuiz ? (
                          <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold ${
                            isPassed ? 'badge-green' : 'badge-amber'
                          }`}>
                            <CheckCircle2 className="size-3" />
                            <span>{quizScore} / {quizTotal} ({quizScorePercent}%)</span>
                          </span>
                        ) : (
                          <span className="text-muted text-xs font-medium">Pending attempt</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Empty>No students have enrolled in this course yet.</Empty>
      )}
    </div>
  );
};

export default function StudentsPage() {
  const params = useParams<{ documentId: string }>();

  return (
    <RequireAuth roles={['Admin', 'Content Manager', 'Instructor']}>
      <Roster documentId={params.documentId} />
    </RequireAuth>
  );
}
