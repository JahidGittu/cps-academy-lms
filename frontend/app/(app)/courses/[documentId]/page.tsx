'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Users,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment, LessonProgress, QuizResult, Single, User } from '@/lib/types';
import { Alert, Button, buttonStyle, Card, Empty, LoadingState, ProgressBar } from '@/components/ui';
import { DetailHeader } from '@/components/course/detail-header';
import { EnrolPanel } from '@/components/course/enrol-panel';
import { JoinForm } from '@/components/course/join-form';
import { Syllabus } from '@/components/course/syllabus';

const Detail = ({ documentId }: { documentId: string }) => {
  const { user, loading: knowingUser } = useAuth();
  const isStudent = hasRole(user, 'Student');

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const course = useApi<Single<Course>>(`/courses/${documentId}`);

  const mine = `/enrollments?filters[course][documentId][$eq]=${documentId}`;

  const enrollments = useApi<Collection<Enrollment>>(isStudent ? mine : null);
  const enrollment = enrollments.data?.data?.[0];

  const finished = useApi<Collection<LessonProgress>>(
    enrollment
      ? `/lesson-progresses?filters[lesson][course][documentId][$eq]=${documentId}&populate=lesson`
      : null
  );

  const completed = new Set((finished.data?.data ?? []).map((row) => row.lesson?.documentId));

  const detail = course.data?.data;
  const quizResults = useApi<Collection<QuizResult>>(
    enrollment && detail?.quiz
      ? `/quiz-results?filters[quiz][documentId][$eq]=${detail.quiz.documentId}&sort=createdAt:desc`
      : null
  );
  const lastQuizResult = quizResults.data?.data?.[0];

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

  const enrol = () => act(() => api.post('/enrollments', { data: { course: documentId } }));

  const joined = async (who: User) => {
    await course.reload();

    if (!hasRole(who, 'Student')) return;

    const { data } = await api.get<Collection<Enrollment>>(mine);

    if (data.data.length) await enrollments.reload();
    else await enrol();
  };

  if (course.loading) {
    return <LoadingState />;
  }

  if (course.error) return <Alert>{course.error}</Alert>;

  if (!detail) return <Empty>This course does not exist.</Empty>;

  const lessons = detail.lessons ?? [];
  const percent = lessons.length ? Math.round((completed.size / lessons.length) * 100) : 0;

  const readable = isStudent ? Boolean(enrollment) : Boolean(detail.owned);

  const nextUp = lessons.findIndex((lesson) => !completed.has(lesson.documentId));
  const next = nextUp === -1 ? null : lessons[nextUp];

  const isOpen = (index: number) =>
    readable && (isStudent ? nextUp === -1 || index <= nextUp : true);

  const quizLink = detail.quiz ? `/quizzes/${detail.quiz.documentId}` : '';

  const action = () => {
    if (detail.owned) {
      return (
        <div className="space-y-2">
          <Link href={`/courses/${documentId}/edit`} className={`${buttonStyle()} w-full`}>
            <Pencil className="size-4" />
            Edit this course
          </Link>

          <Link
            href={`/courses/${documentId}/students`}
            className={`${buttonStyle('plain')} w-full`}
          >
            <Users className="size-4" />
            Student progress
          </Link>
        </div>
      );
    }

    if (enrollment) {
      return (
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium text-primary">
              {completed.size} of {lessons.length} done
            </span>
            <span className="text-muted">{percent}%</span>
          </div>

          <div className="mt-2">
            <ProgressBar percent={percent} />
          </div>

          {lastQuizResult && (
            <div className="mt-3 rounded-md bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-700 dark:text-[#3fb950] shadow-2xs">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-[#3fb950]" />
                Course Completed
              </p>
              <p className="mt-1 text-[11px]">
                Quiz Score: <strong className="font-bold text-primary">{lastQuizResult.score} / {lastQuizResult.total}</strong> ({Math.round((lastQuizResult.score / lastQuizResult.total) * 100)}%)
              </p>
            </div>
          )}

          {next ? (
            <Link href={`/lessons/${next.documentId}`} className={`${buttonStyle()} mt-4 w-full`}>
              {completed.size ? 'Continue' : 'Start the first lesson'}
              <ArrowRight className="size-4" />
            </Link>
          ) : detail.quiz && !lastQuizResult ? (
            <Link href={quizLink} className={`${buttonStyle()} mt-4 w-full`}>
              <span>Take Quiz Assessment</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      );
    }

    if (isStudent) {
      return (
        <Button disabled={busy} className="w-full" onClick={enrol}>
          {busy ? 'Enrolling' : 'Enrol in this course'}
        </Button>
      );
    }

    if (user) {
      return (
        <p className="text-sm text-muted">
          Enrolling is a student thing to do, and this account is signed in as{' '}
          {user.role?.name ?? 'something else'}.
        </p>
      );
    }

    if (knowingUser) return <p className="text-sm text-muted">One moment</p>;

    return <JoinForm onAuthenticated={joined} />;
  };

  return (
    <div className="space-y-8">
      <DetailHeader course={detail} lessons={lessons.length} />

      <Alert>{actionError}</Alert>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-lg font-bold text-primary">What you will work through</h2>

            <Syllabus
              lessons={lessons}
              done={(id) => completed.has(id)}
              open={(index) => isOpen(index)}
            />

            {isStudent && readable && nextUp !== -1 && (
              <p className="mt-2 text-xs text-muted font-medium">
                Lessons open one at a time. Mark the open one as complete to unlock the next.
              </p>
            )}

            {!readable && lessons.length > 0 && (
              <p className="mt-2 text-xs text-muted font-medium">
                Titles are open to read. Enrolling is what opens the lessons themselves.
              </p>
            )}
          </section>

          {detail.quiz && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-primary">Quiz Assessment</h2>

              <Card>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <ClipboardList className="size-4 text-purple-500" />
                      <span>{detail.quiz.title}</span>
                      {lastQuizResult && (
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-[#3fb950] border border-emerald-500/30">
                          Score: {lastQuizResult.score} / {lastQuizResult.total}
                        </span>
                      )}
                    </p>
                    {lastQuizResult && (
                      <p className="text-xs text-muted mt-0.5">
                        Latest attempt submitted on {new Date(lastQuizResult.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {readable ? (
                    <Link
                      href={quizLink}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                        lastQuizResult
                          ? 'border border-theme bg-surface text-secondary hover:bg-elevated hover:text-brand'
                          : 'bg-brand-subtle text-brand hover:bg-brand-subtle/80 border border-brand-border'
                      }`}
                    >
                      <span>{lastQuizResult ? 'See Quiz Details' : 'Start Quiz'}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted font-medium">Opens once you enrol</span>
                  )}
                </div>
              </Card>
            </section>
          )}
        </div>

        {/* Sticky Enrol Panel Column */}
        <aside className="lg:col-span-1 lg:sticky lg:top-24 self-start space-y-4">
          <EnrolPanel course={detail} lessons={lessons.length}>
            {action()}
          </EnrolPanel>
        </aside>
      </div>
    </div>
  );
};

export default function CoursePage() {
  const params = useParams<{ documentId: string }>();

  return <Detail documentId={params.documentId} />;
}
