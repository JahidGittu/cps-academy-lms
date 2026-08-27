'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Course, CourseProgress, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Empty, LoadingState, ProgressBar } from '@/components/ui';

const Roster = ({ documentId }: { documentId: string }) => {
  const course = useApi<Single<Course>>(`/courses/${documentId}`);

  // The same route a student's own dashboard card reads, so the percentage an instructor quotes to
  // somebody is the percentage that somebody was shown. It counts a roster of one for a student and
  // the whole class for whoever runs the course.
  const progress = useApi<Single<CourseProgress>>(`/courses/${documentId}/progress`);

  if (course.loading || progress.loading) {
    return (
      <LoadingState
        message="Loading student roster..."
        subtext="Fetching enrolled student completion rates and quiz assessment scores."
      />
    );
  }

  const detail = course.data?.data;

  if (!detail) return <Empty>This course does not exist.</Empty>;

  // Checked before the progress error, because that route answers 404 to anyone who does not run the
  // course, and "not found" is not what went wrong from the reader's side.
  if (!detail.owned) return <Empty>This course belongs to someone else.</Empty>;

  if (progress.error) return <Alert>{progress.error}</Alert>;

  const summary = progress.data?.data;
  const rows = summary?.students ?? [];

  return (
    <div className="space-y-6">
      <Link
        href={`/courses/${documentId}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        {detail.title}
      </Link>

      {rows.length ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Lessons</th>
                <th className="w-48 px-5 py-3 font-medium">Progress</th>
                <th className="px-5 py-3 font-medium">Quiz</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((student) => (
                <tr key={student.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3">{student.username}</td>

                  <td className="px-5 py-3 text-slate-600">
                    {student.completedLessons} of {summary?.totalLessons ?? 0}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar percent={student.percentComplete} />

                      <span className="w-9 shrink-0 text-right text-xs text-slate-500">
                        {student.percentComplete}%
                      </span>
                    </div>
                  </td>

                  {/* Words rather than 0 out of 0, because never sitting the quiz and getting
                      everything wrong are different things to read about a student. */}
                  <td className="px-5 py-3 text-slate-600">
                    {student.quizTotal ? (
                      `${student.quizScore} / ${student.quizTotal}`
                    ) : (
                      <span className="text-slate-400">Not taken</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Nobody has enrolled on this course yet.</Empty>
      )}
    </div>
  );
};

export default function CourseStudentsPage() {
  const params = useParams<{ documentId: string }>();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Students</h1>

      <RequireAuth roles={['Instructor', 'Content Manager', 'Admin']}>
        <Roster documentId={params.documentId} />
      </RequireAuth>
    </div>
  );
}
