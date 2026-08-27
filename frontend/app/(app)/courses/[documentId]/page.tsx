'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, ClipboardList, Pencil, Users } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment, LessonProgress, Single, User } from '@/lib/types';
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

  // Asked as a filter on the course rather than by listing every enrollment and searching the
  // result, so the answer does not get longer as the student signs up for more courses.
  const mine = `/enrollments?filters[course][documentId][$eq]=${documentId}`;

  const enrollments = useApi<Collection<Enrollment>>(isStudent ? mine : null);
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

  const enrol = () => act(() => api.post('/enrollments', { data: { course: documentId } }));

  // Handed the account by the form in the panel, because this component has not re-rendered with it
  // yet. A new account is a student with nothing on it, so the enrolment goes straight through.
  // Signing in instead could be an account already enrolled, or the instructor who owns the course,
  // and posting an enrollment for either would come back as an error nobody asked for.
  const joined = async (who: User) => {
    await course.reload();

    if (!hasRole(who, 'Student')) return;

    const { data } = await api.get<Collection<Enrollment>>(mine);

    if (data.data.length) await enrollments.reload();
    else await enrol();
  };

  if (course.loading) {
    return (
      <LoadingState
        message="Loading course curriculum..."
        subtext="Retrieving syllabus outline, lessons, and assessment status."
      />
    );
  }

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
  const next = nextUp === -1 ? null : lessons[nextUp];

  const isOpen = (index: number) =>
    readable && (isStudent ? nextUp === -1 || index <= nextUp : true);

  const quizLink = detail.quiz ? `/quizzes/${detail.quiz.documentId}` : '';

  // Four people can be looking at this panel and each of them wants a different button.
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
            <span className="font-medium">
              {completed.size} of {lessons.length} done
            </span>
            <span className="text-slate-500">{percent}%</span>
          </div>

          <div className="mt-2">
            <ProgressBar percent={percent} />
          </div>

          {next ? (
            <Link href={`/lessons/${next.documentId}`} className={`${buttonStyle()} mt-4 w-full`}>
              {completed.size ? 'Continue' : 'Start the first lesson'}
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            detail.quiz && (
              <Link href={quizLink} className={`${buttonStyle()} mt-4 w-full`}>
                Open the quiz
                <ArrowRight className="size-4" />
              </Link>
            )
          )}

          <Button
            variant="plain"
            disabled={busy}
            className="mt-2 w-full"
            onClick={() => act(() => api.delete(`/enrollments/${enrollment.documentId}`))}
          >
            Leave course
          </Button>
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
        <p className="text-sm text-slate-500">
          Enrolling is a student thing to do, and this account is signed in as{' '}
          {user.role?.name ?? 'something else'}.
        </p>
      );
    }

    // Nothing until the session is known, or a student who is already enrolled watches a signup form
    // flash past on the first paint.
    if (knowingUser) return <p className="text-sm text-slate-400">One moment</p>;

    return <JoinForm onAuthenticated={joined} />;
  };

  return (
    <div className="space-y-8">
      <DetailHeader course={detail} lessons={lessons.length} />

      <Alert>{actionError}</Alert>

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-900">What you will work through</h2>

            <Syllabus
              lessons={lessons}
              done={(id) => completed.has(id)}
              open={(index) => isOpen(index)}
            />

            {isStudent && readable && nextUp !== -1 && (
              <p className="mt-2 text-xs text-slate-500 font-medium">
                Lessons open one at a time. Mark the open one as complete to unlock the next.
              </p>
            )}

            {!readable && lessons.length > 0 && (
              <p className="mt-2 text-xs text-slate-500 font-medium">
                Titles are open to read. Enrolling is what opens the lessons themselves.
              </p>
            )}
          </section>

          {detail.quiz && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900">Quiz Assessment</h2>

              <Card>
                <div className="flex items-center justify-between gap-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <ClipboardList className="size-4 text-violet-600" />
                    {detail.quiz.title}
                  </p>

                  {readable ? (
                    <Link
                      href={quizLink}
                      className="rounded-md bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition shadow-2xs"
                    >
                      Start Quiz →
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">Opens once you enrol</span>
                  )}
                </div>
              </Card>
            </section>
          )}
        </div>

        {/* Sticky Enrol Panel Column */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 z-20 space-y-4">
            <EnrolPanel course={detail} lessons={lessons.length}>
              {action()}
            </EnrolPanel>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default function CoursePage() {
  const params = useParams<{ documentId: string }>();

  // Open to a visitor, because a course page is what a search result or a shared link lands on. The
  // titles are all it gives away; the lesson bodies are behind their own route and the enrollment
  // check that comes with it.
  return <Detail documentId={params.documentId} />;
}
