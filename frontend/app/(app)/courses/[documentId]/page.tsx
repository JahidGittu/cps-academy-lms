'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Users,
  ShieldAlert,
  BookOpen,
  Sparkles,
  Award,
  Clock,
  Unlock,
  Video,
  FileText,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment, LessonProgress, QuizResult, Single, User } from '@/lib/types';
import { Alert, Button, buttonStyle, Card, Empty, LoadingState, ProgressBar } from '@/components/ui';
import { DetailHeader } from '@/components/course/detail-header';
import { CourseCover } from '@/components/course-cover';
import { JoinForm } from '@/components/course/join-form';
import { Syllabus } from '@/components/course/syllabus';
import { toast } from '@/components/toast';

const Detail = ({ documentId }: { documentId: string }) => {
  const router = useRouter();
  const { user, loading: knowingUser } = useAuth();
  const isStudent = hasRole(user, 'Student');
  const isAdmin = hasRole(user, 'Admin');
  const isContentManager = hasRole(user, 'Content Manager');

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);

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

  const enrol = async () => {
    await act(async () => {
      await api.post('/enrollments', { data: { course: documentId } });
      toast.success('Successfully enrolled in course track! Opening Lesson 1...', 'Enrollment Confirmed!');
      setCountdown(3);
    });
  };

  const joined = async (who: User) => {
    await course.reload();

    if (!hasRole(who, 'Student')) return;

    const { data } = await api.get<Collection<Enrollment>>(mine);

    if (data.data.length) {
      await enrollments.reload();
    } else {
      await enrol();
    }
  };

  const lessons = detail?.lessons ?? [];
  const hasVideos = lessons.some((lesson) => Boolean(lesson.videoUrl && lesson.videoUrl.trim() !== ''));
  const hasQuiz = Boolean(detail?.quiz);
  const totalMilestones = lessons.length + (hasQuiz ? 1 : 0);
  const completedMilestones = completed.size + (lastQuizResult ? 1 : 0);
  const percent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const isAuthor = Boolean(detail?.owned) || isAdmin || isContentManager;
  const isEnrolledStudent = isStudent && Boolean(enrollment);

  const nextUp = lessons.findIndex((lesson) => !completed.has(lesson.documentId));
  const next = nextUp === -1 ? null : lessons[nextUp];

  // Automated 3-second redirect countdown to Lesson 1 upon successful enrollment
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0 && next) {
      router.push(`/lessons/${next.documentId}`);
    }
  }, [countdown, next, router]);

  const isOpen = (index: number) =>
    isEnrolledStudent && (nextUp === -1 || index <= nextUp);

  const quizLink = detail?.quiz ? `/quizzes/${detail.quiz.documentId}` : '';

  if (course.loading) {
    return <LoadingState />;
  }

  if (course.error) return <Alert>{course.error}</Alert>;

  if (!detail) return <Empty>This course does not exist.</Empty>;

  const action = () => {
    if (isAuthor) {
      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3.5 text-xs text-sky-400">
            <p className="font-bold flex items-center gap-1.5">
              <span>Course Author & Management</span>
            </p>
            <p className="mt-1 text-muted text-[11px] leading-relaxed">
              You manage this course. Use the studio below to edit lessons, update quiz answers, and monitor enrolled students.
            </p>
          </div>

          <Link
            href={`/courses/${documentId}/edit`}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/25 transition-all w-full"
          >
            <Pencil className="size-3.5" />
            <span>Edit Course Builder</span>
          </Link>

          <Link
            href={`/courses/${documentId}/students`}
            className="flex items-center justify-center gap-2 rounded-xl border border-theme bg-surface hover:bg-elevated px-4 py-2.5 text-xs font-bold text-secondary hover:text-primary transition-all w-full"
          >
            <Users className="size-3.5" />
            <span>View Student Progress & Roster</span>
          </Link>
        </div>
      );
    }

    if (enrollment) {
      return (
        <div className="space-y-3.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>
                {completed.size} of {lessons.length} lessons {hasQuiz ? `• Quiz ${lastQuizResult ? 'Graded' : 'Pending'}` : 'done'}
              </span>
            </span>
            <span className="font-bold text-brand">{percent}%</span>
          </div>

          <div>
            <ProgressBar percent={percent} />
          </div>

          {lastQuizResult && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs shadow-2xs">
              <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Award className="size-4" />
                <span>Track Completed & Graded</span>
              </p>
              <p className="mt-1 text-[11px] text-secondary">
                Quiz Score: <strong className="font-bold text-primary">{lastQuizResult.score} / {lastQuizResult.total}</strong> ({Math.round((lastQuizResult.score / lastQuizResult.total) * 100)}%)
              </p>
            </div>
          )}

          {next ? (
            <Link
              href={`/lessons/${next.documentId}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-3 text-xs font-bold text-white shadow-md shadow-sky-600/25 transition-all w-full"
            >
              <span>
                {countdown !== null && countdown > 0
                  ? `Opening Lesson 1 in ${countdown}s...`
                  : completed.size
                  ? 'Continue Next Lesson'
                  : 'Start the First Lesson'}
              </span>
              <ArrowRight className="size-4" />
            </Link>
          ) : detail.quiz && !lastQuizResult ? (
            <Link
              href={quizLink}
              className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-3 text-xs font-bold text-white shadow-md shadow-purple-600/25 transition-all w-full"
            >
              <span>Take Quiz Assessment</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      );
    }

    if (isStudent) {
      return (
        <div className="space-y-3">
          <Button
            disabled={busy}
            className="w-full bg-sky-600 hover:bg-sky-500 font-bold py-3 text-sm shadow-md shadow-sky-600/25 cursor-pointer"
            onClick={enrol}
          >
            {busy ? (
              'Enrolling into track...'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="size-4" />
                <span>Enroll in this Course</span>
              </span>
            )}
          </Button>
          <p className="text-[11px] text-muted text-center">
            Free instant enrollment with sequential progress tracking.
          </p>
        </div>
      );
    }

    if (user) {
      return (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-400">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="size-4 text-amber-400" />
            <span>Role Notice</span>
          </p>
          <p className="mt-1 text-[11px] text-muted leading-relaxed">
            Course enrollment and quiz grading are reserved for <strong>Student</strong> accounts. Your account is logged in as <strong>{user.role?.name ?? 'Staff'}</strong>.
          </p>
        </div>
      );
    }

    if (knowingUser) return <p className="text-sm text-muted">One moment...</p>;

    return <JoinForm onAuthenticated={joined} />;
  };

  return (
    <div className="space-y-8">
      {/* Course Banner Header */}
      <DetailHeader course={detail} lessons={lessons.length} />

      <Alert>{actionError}</Alert>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Syllabus & Curriculum Section */}
        <div className="space-y-8 lg:col-span-2">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <BookOpen className="size-5 text-sky-400" />
                <span>Curriculum & Syllabus</span>
              </h2>
              <span className="text-xs font-semibold text-muted bg-surface px-2.5 py-1 rounded-md border border-theme">
                {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
              </span>
            </div>

            <Syllabus
              lessons={lessons}
              done={(id) => completed.has(id)}
              open={(index) => isOpen(index)}
              isAuthor={isAuthor}
              courseDocId={documentId}
            />

            {isEnrolledStudent && nextUp !== -1 && (
              <p className="mt-2.5 text-xs text-muted font-medium flex items-center gap-1.5">
                <Unlock className="size-3.5 text-sky-400" />
                <span>Lessons open one at a time. Mark the open one as complete to unlock the next.</span>
              </p>
            )}

            {!isAuthor && !isEnrolledStudent && lessons.length > 0 && (
              <p className="mt-2.5 text-xs text-muted font-medium">
                Lesson titles and outlines are open to read. Enrolling unlocks full video players and notes.
              </p>
            )}
          </section>

          {/* Quiz Assessment Section */}
          {detail.quiz && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-primary flex items-center gap-2">
                <ClipboardList className="size-5 text-purple-400" />
                <span>Quiz Assessment</span>
              </h2>

              <Card>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <ClipboardList className="size-4 text-purple-400" />
                      <span>{detail.quiz.title}</span>
                      {lastQuizResult && (
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                          Score: {lastQuizResult.score} / {lastQuizResult.total}
                        </span>
                      )}
                    </p>
                    {lastQuizResult ? (
                      <p className="text-xs text-muted mt-0.5">
                        Latest attempt submitted on {new Date(lastQuizResult.createdAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-muted mt-0.5">
                        Test your mastery across all milestones with auto-graded evaluation.
                      </p>
                    )}
                  </div>

                  {isAuthor ? (
                    <Link
                      href={`/courses/${documentId}/edit?tab=quiz`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 transition shadow-2xs"
                    >
                      <Pencil className="size-3" />
                      <span>Edit Quiz &rarr;</span>
                    </Link>
                  ) : isEnrolledStudent ? (
                    <Link
                      href={quizLink}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition shadow-2xs ${
                        lastQuizResult
                          ? 'border border-theme bg-surface text-secondary hover:bg-elevated hover:text-sky-400'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/25'
                      }`}
                    >
                      <span>{lastQuizResult ? 'Review Quiz Details' : 'Start Quiz Assessment'}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted font-medium bg-surface px-2.5 py-1 rounded-md border border-theme">
                      Opens upon enrollment
                    </span>
                  )}
                </div>
              </Card>
            </section>
          )}
        </div>

        {/* Sticky Sidebar Column: Cover Preview + Features List + Enrollment Action */}
        <aside className="lg:col-span-1 lg:sticky lg:top-24 self-start space-y-4">
          <div className="rounded-xl border border-theme bg-surface overflow-hidden shadow-md">
            {/* Course Cover Image Banner */}
            <div className="relative">
              <CourseCover
                title={detail.title}
                url={detail.coverImageUrl}
                className="h-44 sm:h-48 w-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="rounded-md bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/10 shadow-xs">
                  {detail.instructor ? `By ${detail.instructor}` : 'CPS Academy'}
                </span>
              </div>
            </div>

            {/* Action Area */}
            <div className="p-5 border-b border-theme">
              {action()}
            </div>

            {/* "This Course Includes" Value Proposition */}
            <div className="p-5 bg-elevated/40 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
                This Course Track Includes
              </h4>

              <ul className="space-y-2.5 text-xs text-secondary">
                <li className="flex items-center gap-2.5">
                  <BookOpen className="size-4 text-sky-400 shrink-0" />
                  <span><strong>{lessons.length}</strong> structured sequential lessons</span>
                </li>

                <li className="flex items-center gap-2.5">
                  {hasVideos ? (
                    <>
                      <Video className="size-4 text-indigo-400 shrink-0" />
                      <span>HD Video players & rich text tutorials</span>
                    </>
                  ) : (
                    <>
                      <FileText className="size-4 text-indigo-400 shrink-0" />
                      <span>In-depth technical guides & reading notes</span>
                    </>
                  )}
                </li>

                {detail.quiz && (
                  <li className="flex items-center gap-2.5">
                    <ClipboardList className="size-4 text-purple-400 shrink-0" />
                    <span>Instant auto-graded MCQ assessment</span>
                  </li>
                )}

                <li className="flex items-center gap-2.5">
                  <Clock className="size-4 text-amber-400 shrink-0" />
                  <span>Full lifetime access & self-paced learning</span>
                </li>

                <li className="flex items-center gap-2.5">
                  <Award className="size-4 text-rose-400 shrink-0" />
                  <span>Verified course completion badge</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default function CourseDetailPage() {
  const params = useParams<{ documentId: string }>();

  return <Detail documentId={params.documentId} />;
}
