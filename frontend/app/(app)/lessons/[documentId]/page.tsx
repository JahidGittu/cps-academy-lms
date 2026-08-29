'use client';

import { useState, useTransition } from 'react';
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
  ClipboardList,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Lesson, LessonProgress, Single } from '@/lib/types';
import { Alert, Button, Empty, Skeleton, ProgressBar } from '@/components/ui';
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

// Compact, clean initial skeleton (neutral for both text and video lessons)
const LessonPageSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-200">
    <div className="flex items-center justify-between pb-4 border-b border-theme">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24 rounded" />
        <span className="text-muted">/</span>
        <Skeleton className="h-4 w-48 rounded" />
      </div>
    </div>

    <div className="grid gap-8 lg:grid-cols-12 items-start">
      <article className="lg:col-span-8 space-y-5 animate-pulse">
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <div className="rounded-xl bg-surface p-6 sm:p-8 border border-theme space-y-3.5 shadow-xs">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-11/12 rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-theme">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </article>

      <aside className="lg:col-span-4 space-y-4">
        <div className="rounded-xl border border-theme bg-surface p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="p-3 rounded-lg bg-elevated/40 border border-theme/60 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-3.5 w-10 rounded" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="space-y-2 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  </div>
);

const Viewer = ({ documentId }: { documentId: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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

  // Instant zero-buffering completion & transition
  const completeAndNext = async (targetUrl: string) => {
    if (!completed) {
      setJustCompleted(true);
      // Persist to Strapi in background without holding up navigation
      api.post('/lesson-progresses', { data: { lesson: documentId } }).catch((err) => {
        console.warn('Background progress save', err);
      });
    }

    startTransition(() => {
      router.push(targetUrl);
    });
  };

  // Render seamless structured skeleton ONLY on initial cold load before any data exists
  if (lesson.loading && !lesson.data) {
    return <LessonPageSkeleton />;
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
      <div className="mx-auto max-w-lg rounded-xl border border-theme bg-surface p-8 text-center shadow-md">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Lock className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-primary">Lesson Locked</h2>
        <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
          Please complete the earlier lessons in this course first in sequential order to unlock this lesson.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/25 transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Go to My Dashboard</span>
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 rounded-lg border border-theme bg-surface px-4 py-2 text-xs font-semibold text-secondary hover:bg-elevated hover:text-primary transition"
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
  if ((justCompleted || completed) && detail) {
    completedSet.add(detail.id);
  }

  const completedCount = siblings.filter((item) => completedSet.has(item.id)).length;
  const hasQuiz = Boolean(course?.quiz);
  const totalMilestones = siblings.length + (hasQuiz ? 1 : 0);
  const percentComplete = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

  const isTransitioning = isPending || (lesson.loading && lesson.data !== null);

  return (
    <div className="space-y-6 relative">
      {/* Top subtle progress indicator during navigation */}
      {isTransitioning && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 z-50 animate-pulse" />
      )}

      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-theme">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            href={course ? `/courses/${course.documentId}` : '/courses'}
            className="inline-flex items-center gap-1.5 font-medium text-muted hover:text-sky-400 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>{course?.title ?? 'Courses'}</span>
          </Link>
          <span className="text-muted">/</span>
          <span className="font-bold text-primary truncate max-w-md">{detail.title}</span>
        </div>
      </div>

      {/* Main Grid: Content & Syllabus Playlist */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Main Lesson Body (8 cols) with smooth in-place fade during transition */}
        <article
          className={`lg:col-span-8 space-y-6 transition-opacity duration-200 ${
            isTransitioning ? 'opacity-60 pointer-events-none' : 'opacity-100'
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight leading-tight">
            {detail.title}
          </h1>

          {/* Embedded Video Player */}
          {embed ? (
            <div className="overflow-hidden rounded-xl border border-theme bg-black shadow-md">
              <iframe
                src={embed}
                title={detail.title}
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          ) : (
            detail.videoUrl && (
              <div className="rounded-xl border border-theme bg-surface p-4 flex items-center gap-3">
                <Play className="size-4 text-sky-400 shrink-0" />
                <a
                  href={detail.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-semibold text-sky-400 hover:underline"
                >
                  Watch Video Lecture ↗
                </a>
              </div>
            )
          )}

          {/* Written Content */}
          {detail.content && (
            <div className="rounded-xl bg-surface p-6 sm:p-8 border border-theme shadow-xs leading-relaxed text-secondary">
              <RichContent content={detail.content} />
            </div>
          )}

          <Alert>{actionError}</Alert>

          {/* Sequential Navigation Bar: Instant Zero-Lag Navigation */}
          <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-theme pt-6 mt-8">
            {previous ? (
              <Link
                href={`/lessons/${previous.documentId}`}
                prefetch={true}
                className="inline-flex items-center gap-2 rounded-xl border border-theme bg-surface px-4 py-2.5 text-xs font-semibold text-secondary hover:bg-elevated hover:text-primary transition shadow-xs cursor-pointer"
              >
                <ArrowLeft className="size-4 text-muted" />
                <span>Previous</span>
              </Link>
            ) : (
              <div />
            )}

            {/* Next Button / Action: Seamless Fast Transition */}
            {next ? (
              <button
                type="button"
                disabled={isPending || busy}
                onClick={() => completeAndNext(`/lessons/${next.documentId}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/25 transition cursor-pointer"
              >
                <span>{isPending ? 'Loading...' : 'Next Lesson'}</span>
                <ArrowRight className="size-4" />
              </button>
            ) : isLastLesson && course?.quiz ? (
              <button
                type="button"
                disabled={isPending || busy}
                onClick={() => course.quiz && completeAndNext(`/quizzes/${course.quiz.documentId}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-purple-600/25 transition cursor-pointer"
              >
                <span>{isPending ? 'Opening...' : 'Take Quiz Assessment'}</span>
                <Award className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending || busy}
                onClick={() => completeAndNext(course ? `/courses/${course.documentId}` : '/dashboard')}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-emerald-600/25 transition cursor-pointer"
              >
                <span>{isPending ? 'Completing...' : 'Finish Course'}</span>
                <CheckCircle2 className="size-4" />
              </button>
            )}
          </nav>
        </article>

        {/* Right Sidebar: Syllabus Track Playlist with Live Progress Bar (4 cols) */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 self-start">
          <div className="rounded-xl border border-theme bg-surface p-5 shadow-xs">
            <h3 className="font-bold text-primary text-sm flex items-center justify-between gap-2 mb-3 pb-3 border-b border-theme">
              <span className="flex items-center gap-2">
                <BookOpen className="size-4 text-sky-400" />
                <span>Course Track</span>
              </span>
              <span className="text-xs text-muted font-medium">
                {siblings.length} {siblings.length === 1 ? 'lesson' : 'lessons'} {hasQuiz ? '+ Quiz' : ''}
              </span>
            </h3>

            {/* Live Progress Bar & Percentage in Lesson Sidebar */}
            <div className="mb-4 p-3 rounded-lg bg-elevated/40 border border-theme/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-secondary">
                  <strong>{completedCount}</strong> of {siblings.length} lessons {hasQuiz ? '• Quiz Next' : 'completed'}
                </span>
                <span className="font-bold text-sky-400">{percentComplete}%</span>
              </div>
              <ProgressBar percent={percentComplete} />
            </div>

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
                    prefetch={true}
                    className={`flex items-center gap-2.5 rounded-lg p-2.5 text-xs transition-all ${
                      isCurrent
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : isItemDone
                        ? 'text-secondary hover:bg-emerald-500/10 hover:text-emerald-400'
                        : 'text-secondary hover:bg-elevated hover:text-primary'
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded font-bold text-[10px] ${
                        isCurrent
                          ? 'bg-white/20 text-white'
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

              {/* Quiz Assessment Final Milestone Item in Sidebar */}
              {course?.quiz && (
                <div className="pt-2 mt-2 border-t border-theme/60">
                  {completedCount >= siblings.length ? (
                    <Link
                      href={`/quizzes/${course.quiz.documentId}`}
                      className="flex items-center gap-2.5 rounded-lg p-2.5 text-xs bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 font-bold transition shadow-xs"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded bg-purple-500/30 text-purple-300 font-bold text-[10px]">
                        <Award className="size-3" />
                      </span>
                      <span className="truncate flex-1">{course.quiz.title || 'Final Quiz Assessment'}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded">
                        Ready
                      </span>
                    </Link>
                  ) : (
                    <div
                      title="Complete all lessons to unlock the Final Quiz Assessment"
                      className="flex items-center gap-2.5 rounded-lg p-2.5 text-xs bg-canvas text-muted border border-theme/60 cursor-not-allowed select-none opacity-70"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded bg-elevated text-muted font-bold text-[10px]">
                        <Lock className="size-3" />
                      </span>
                      <span className="truncate flex-1 font-medium">{course.quiz.title || 'Final Quiz Assessment'}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold bg-elevated text-muted px-1.5 py-0.5 rounded">
                        Quiz
                      </span>
                    </div>
                  )}
                </div>
              )}
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
