'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Play,
  Lock,
  BookOpen,
  Award,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Lesson, LessonProgress, Single } from '@/lib/types';
import { Alert, Button, Empty, LoadingState } from '@/components/ui';
import { RequireAuth } from '@/components/require-auth';
import { RichContent } from '@/components/rich-content';

const lessonQuery = (documentId: string) =>
  `/lessons/${documentId}?populate[course][fields]=title,documentId` +
  `&populate[course][populate][lessons][fields]=title,order,documentId,id` +
  `&populate[course][populate][lessons][sort]=order:asc` +
  `&populate[course][populate][quiz][fields]=title,documentId`;

const embedUrl = (url: string) => {
  const id = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([\w-]{11})/);
  return id ? `https://www.youtube.com/embed/${id[1]}` : null;
};

const Viewer = ({ documentId }: { documentId: string }) => {
  const router = useRouter();
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);

  const lesson = useApi<Single<Lesson>>(lessonQuery(documentId));

  const progress = useApi<Collection<LessonProgress>>(
    isStudent ? `/lesson-progresses?filters[lesson][documentId][$eq]=${documentId}` : null
  );

  const allProgresses = useApi<Collection<LessonProgress>>(
    isStudent ? '/lesson-progresses?populate=lesson' : null
  );

  const completed = Boolean(progress.data?.data?.length) || justCompleted;

  const markDone = async () => {
    setBusy(true);
    setActionError('');

    try {
      await api.post('/lesson-progresses', { data: { lesson: documentId } });
      setJustCompleted(true);
      await progress.reload();
      await allProgresses.reload();
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const completeAndNext = async (targetUrl: string) => {
    if (!completed) {
      setBusy(true);
      setActionError('');
      try {
        await api.post('/lesson-progresses', { data: { lesson: documentId } });
        setJustCompleted(true);
        await progress.reload();
        await allProgresses.reload();
        router.push(targetUrl);
      } catch (caught) {
        setActionError(errorMessage(caught));
        setBusy(false);
      }
    } else {
      router.push(targetUrl);
    }
  };

  if (lesson.loading || (isStudent && allProgresses.loading)) {
    return <LoadingState />;
  }

  if (lesson.status === 404) {
    return (
      <Empty>
        <p className="font-semibold text-slate-800">Lesson unavailable</p>
        <p className="mt-1 text-sm text-slate-500">
          This lesson is either not enrolled or does not exist.
        </p>
        <Link href="/courses" className="mt-4 inline-block font-semibold text-brand-600 hover:underline">
          Browse Course Catalogue →
        </Link>
      </Empty>
    );
  }

  // Sequential 403 Forbidden Screen with helpful user guidance
  if (lesson.status === 403) {
    return (
      <div className="mx-auto max-w-lg rounded-md border border-slate-200 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
          <Lock className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Lesson Locked</h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Please complete the earlier lessons in this course first to unlock this lesson.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="brand-gradient inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95"
          >
            <ArrowLeft className="size-3.5" />
            <span>Go to My Dashboard</span>
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Browse Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  if (lesson.error) return <Alert>{lesson.error}</Alert>;

  const detail = lesson.data?.data;
  if (!detail) return <Empty>Lesson details are not available.</Empty>;

  const course = detail.course;
  const siblings = course?.lessons ?? [];
  const at = siblings.findIndex((row) => row.documentId === documentId);
  const previous = at > 0 ? siblings[at - 1] : null;
  const next = at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : null;
  const isLastLesson = at === siblings.length - 1;
  const embed = detail.videoUrl ? embedUrl(detail.videoUrl) : null;

  const completedSet = new Set(
    (allProgresses.data?.data ?? [])
      .map((row) => row.lesson?.id)
      .filter((id): id is number => id !== undefined)
  );
  if (justCompleted && detail) {
    completedSet.add(detail.id);
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            href={course ? `/courses/${course.documentId}` : '/courses'}
            className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>{course?.title ?? 'Courses'}</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 truncate max-w-md">{detail.title}</span>
        </div>

        <span className="rounded bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-bold text-brand-700">
          Lesson {at + 1} of {siblings.length}
        </span>
      </div>

      {/* Main Grid: Content & Syllabus Playlist */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Main Lesson Body (8 cols) */}
        <article className="lg:col-span-8 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            {detail.title}
          </h1>

          {/* Embedded Video Player */}
          {embed ? (
            <div className="overflow-hidden rounded-md border border-slate-800 bg-black shadow-md">
              <iframe
                src={embed}
                title={detail.title}
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          ) : (
            detail.videoUrl && (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
                <Play className="size-4 text-brand-600 shrink-0" />
                <a
                  href={detail.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-semibold text-brand-600 hover:underline"
                >
                  Watch Video Lecture ↗
                </a>
              </div>
            )
          )}

          {/* Written Content */}
          {detail.content && (
            <div className="rounded-lg bg-surface p-6 sm:p-8 border border-theme shadow-2xs leading-relaxed text-secondary">
              <RichContent content={detail.content} />
            </div>
          )}

          <Alert>{actionError}</Alert>

          {/* Sequential Navigation Bar: Only Clean Previous and Next Buttons */}
          <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-subtle pt-6 mt-8">
            {previous ? (
              <Link
                href={`/lessons/${previous.documentId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-theme bg-surface px-4 py-2.5 text-xs font-semibold text-secondary hover:bg-elevated hover:text-primary transition shadow-2xs"
              >
                <ArrowLeft className="size-4 text-muted" />
                <span>Previous</span>
              </Link>
            ) : (
              <div />
            )}

            {/* Next Button / Action: Automatically Marks Current Complete and Advances */}
            {next ? (
              <Button
                disabled={busy}
                onClick={() => completeAndNext(`/lessons/${next.documentId}`)}
                className="font-bold flex items-center gap-2 px-5 py-2.5 shadow-xs"
              >
                <span>{busy ? 'Saving Progress...' : 'Next'}</span>
                <ArrowRight className="size-4" />
              </Button>
            ) : isLastLesson && course?.quiz ? (
              <Button
                disabled={busy}
                onClick={() => course.quiz && completeAndNext(`/quizzes/${course.quiz.documentId}`)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-2 px-5 py-2.5 shadow-xs"
              >
                <span>{busy ? 'Saving...' : 'Take Quiz Assessment'}</span>
                <Award className="size-4" />
              </Button>
            ) : (
              <Button
                disabled={busy}
                onClick={() => completeAndNext(course ? `/courses/${course.documentId}` : '/dashboard')}
                className="font-bold flex items-center gap-2 px-5 py-2.5 shadow-xs"
              >
                <span>{busy ? 'Saving...' : 'Finish Course'}</span>
                <CheckCircle2 className="size-4" />
              </Button>
            )}
          </nav>
        </article>

        {/* Right Sidebar: Syllabus Track Playlist (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-theme bg-surface p-5 shadow-2xs">
            <h3 className="font-bold text-primary text-sm flex items-center justify-between gap-2 mb-3 pb-3 border-b border-subtle">
              <span className="flex items-center gap-2">
                <BookOpen className="size-4 text-brand" />
                <span>Course Track</span>
              </span>
              <span className="text-xs text-muted font-medium">{siblings.length} lessons</span>
            </h3>

            <div className="space-y-1.5">
              {siblings.map((item, index) => {
                const isCurrent = item.documentId === documentId;
                const isItemDone = completedSet.has(item.id) || (isCurrent && completed);

                // An item is unlocked if not a student, or it's lesson 1, or it's completed,
                // or previous lesson is done, or it's at/before current index
                const prevItem = index > 0 ? siblings[index - 1] : null;
                const isUnlocked =
                  !isStudent ||
                  index === 0 ||
                  isItemDone ||
                  (prevItem && (completedSet.has(prevItem.id) || (prevItem.documentId === documentId && completed))) ||
                  index <= at;

                if (!isUnlocked) {
                  return (
                    <div
                      key={item.documentId}
                      title="Locked: Complete earlier lessons in order to unlock this lesson"
                      className="flex items-center gap-2.5 rounded-lg p-2.5 text-xs bg-canvas text-muted border border-theme/60 cursor-not-allowed select-none transition-all opacity-70"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded bg-elevated text-muted font-bold text-[10px]">
                        <Lock className="size-3" />
                      </span>
                      <span className="truncate flex-1 font-medium">{item.title}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold bg-elevated text-muted px-1.5 py-0.5 rounded">
                        Locked
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.documentId}
                    href={`/lessons/${item.documentId}`}
                    className={`flex items-center gap-2.5 rounded-lg p-2.5 text-xs transition-all ${
                      isCurrent
                        ? 'bg-brand-subtle text-brand font-bold border border-brand-border shadow-2xs'
                        : isItemDone
                        ? 'text-secondary hover:bg-emerald-500/10 hover:text-emerald-400'
                        : 'text-secondary hover:bg-elevated hover:text-primary'
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded font-bold text-[10px] ${
                        isCurrent
                          ? 'bg-brand-primary text-white'
                          : isItemDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-elevated text-muted'
                      }`}
                    >
                      {isItemDone ? <CheckCircle2 className="size-3 text-emerald-400" /> : index + 1}
                    </span>

                    <span className="truncate flex-1">{item.title}</span>

                    {isItemDone && !isCurrent && (
                      <span className="text-[10px] font-semibold text-emerald-400">Done</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default function LessonPage() {
  const params = useParams<{ documentId: string }>();

  return (
    <RequireAuth>
      <Viewer documentId={params.documentId} />
    </RequireAuth>
  );
}
