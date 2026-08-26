'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Check, ClipboardList, Lock } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment, LessonProgress, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Card, Empty, ProgressBar } from '@/components/ui';

const Detail = ({ documentId }: { documentId: string }) => {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const course = useApi<Single<Course>>(`/courses/${documentId}`);

  // Asked as a filter on the course rather than by listing every enrollment and searching the
  // result, so the answer does not get longer as the student signs up for more courses.
  const enrollments = useApi<Collection<Enrollment>>(
    isStudent ? `/enrollments?filters[course][documentId][$eq]=${documentId}` : null
  );

  const enrollment = enrollments.data?.data?.[0];

  const finished = useApi<Collection<LessonProgress>>(
    enrollment
      ? `/lesson-progresses?filters[lesson][course][documentId][$eq]=${documentId}&populate=lesson`
      : null
  );

  const completed = new Set((finished.data?.data ?? []).map((row) => row.lesson?.documentId));

  const act = async (run: () => Promise<unknown>) => {
    setBusy(true);
    setActionError('');

    try {
      await run();
      await enrollments.reload();
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  if (course.loading) return <p className="text-sm text-slate-500">Loading course</p>;

  if (course.error) return <Alert>{course.error}</Alert>;

  const detail = course.data?.data;

  if (!detail) return <Empty>This course does not exist.</Empty>;

  const lessons = detail.lessons ?? [];
  const percent = lessons.length ? Math.round((completed.size / lessons.length) * 100) : 0;

  // The same line the lesson controller draws: a student reads a lesson body once enrolled, and the
  // roles that run the course read it because it is theirs. For anyone else the title is all there
  // is, so it is not a link to a request that would come back 404.
  const readable = isStudent ? Boolean(enrollment) : Boolean(detail.owned);

  // A student works through the syllabus in order, so the first lesson they have not finished is as
  // far down the list as the links go. The lesson route refuses the ones past it too; this is so the
  // page does not offer a link that comes back 403.
  const nextUp = lessons.findIndex((lesson) => !completed.has(lesson.documentId));

  const isOpen = (index: number) =>
    readable && (isStudent ? nextUp === -1 || index <= nextUp : true);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{detail.title}</h1>

          {detail.description && <p className="mt-2 text-slate-600">{detail.description}</p>}
        </div>

        {detail.owned && (
          <Link
            href={`/courses/${documentId}/edit`}
            className="shrink-0 text-sm text-slate-900 underline"
          >
            Edit
          </Link>
        )}
      </div>

      <Alert>{actionError}</Alert>

      {isStudent && (
        <Card>
          {enrollment ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {completed.size} of {lessons.length} lessons done
                </p>

                <div className="mt-2">
                  <ProgressBar percent={percent} />
                </div>
              </div>

              <Button
                variant="plain"
                disabled={busy}
                onClick={() => act(() => api.delete(`/enrollments/${enrollment.documentId}`))}
              >
                Leave course
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-600">Enrol to open the lessons and the quiz.</p>

              <Button
                disabled={busy}
                onClick={() => act(() => api.post('/enrollments', { data: { course: documentId } }))}
              >
                Enrol
              </Button>
            </div>
          )}
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-lg font-medium">Lessons</h2>

        {lessons.length ? (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {lessons.map((lesson, index) => (
              <li key={lesson.documentId} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-5 shrink-0 text-slate-400">{index + 1}</span>

                {isOpen(index) ? (
                  <Link href={`/lessons/${lesson.documentId}`} className="flex-1 hover:underline">
                    {lesson.title}
                  </Link>
                ) : (
                  <span className="flex-1 text-slate-500">{lesson.title}</span>
                )}

                {completed.has(lesson.documentId) ? (
                  <Check className="size-4 shrink-0" />
                ) : (
                  !isOpen(index) && <Lock className="size-3.5 shrink-0 text-slate-300" />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No lessons yet.</Empty>
        )}

        {isStudent && readable && nextUp !== -1 && (
          <p className="mt-2 text-xs text-slate-500">
            Lessons open one at a time. Mark the open one as complete to unlock the next.
          </p>
        )}
      </section>

      {detail.quiz && (
        <section>
          <h2 className="mb-3 text-lg font-medium">Quiz</h2>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <p className="flex items-center gap-2 text-sm">
                <ClipboardList className="size-4 text-slate-400" />
                {detail.quiz.title}
              </p>

              {readable && (
                <Link
                  href={`/quizzes/${detail.quiz.documentId}`}
                  className="text-sm text-slate-900 underline"
                >
                  Open
                </Link>
              )}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
};

export default function CoursePage() {
  const params = useParams<{ documentId: string }>();

  return (
    <RequireAuth>
      <Detail documentId={params.documentId} />
    </RequireAuth>
  );
}
