'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Markdown from 'react-markdown';
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

const lessonQuery = (documentId: string) =>
  `/lessons/${documentId}?populate[course][fields]=title,documentId` +
  `&populate[course][populate][lessons][fields]=title,order,documentId` +
  `&populate[course][populate][lessons][sort]=order:asc` +
  `&populate[course][populate][quiz][fields]=title,documentId`;

const embedUrl = (url: string) => {
  const id = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([\w-]{11})/);
  return id ? `https://www.youtube.com/embed/${id[1]}` : null;
};

const Viewer = ({ documentId }: { documentId: string }) => {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);

  const lesson = useApi<Single<Lesson>>(lessonQuery(documentId));

  const progress = useApi<Collection<LessonProgress>>(
    isStudent ? `/lesson-progresses?filters[lesson][documentId][$eq]=${documentId}` : null
  );

  const completed = Boolean(progress.data?.data?.length) || justCompleted;

  const markDone = async () => {
    setBusy(true);
    setActionError('');

    try {
      await api.post('/lesson-progresses', { data: { lesson: documentId } });
      setJustCompleted(true);
      await progress.reload();
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  if (lesson.loading) {
    return (
      <LoadingState
        message="Loading lesson content..."
        subtext="Fetching video lectures and interactive code notes."
      />
    );
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
      <div className="mx-auto max-w-lg rounded-md border border-amber-200 bg-amber-50/80 p-8 text-center shadow-xs">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 border border-amber-200">
          <Lock className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-amber-950">Sequential Progression Locked</h2>
        <p className="mt-2 text-xs sm:text-sm text-amber-900 leading-relaxed">
          Lessons in this track must be completed in order. You cannot skip ahead until earlier lessons are marked as complete.
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
            className="inline-flex items-center gap-1.5 rounded-md bg-white border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100/50"
          >
            <span>Course Outline</span>
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
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed rounded-md bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
              <Markdown>{detail.content}</Markdown>
            </div>
          )}

          <Alert>{actionError}</Alert>

          {/* Student Completion Action Box */}
          {isStudent && (
            <div className="rounded-md border border-slate-200/90 bg-white p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="size-4 text-brand-600" />
                  <span>Lesson Progress</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mark this lesson complete to register your progress and unlock the next lesson.
                </p>
              </div>

              {completed ? (
                <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Lesson Completed</span>
                </div>
              ) : (
                <Button disabled={busy} onClick={markDone} className="shrink-0 font-bold">
                  {busy ? 'Saving Progress...' : 'Mark as Complete ✓'}
                </Button>
              )}
            </div>
          )}

          {/* Sequential Navigation Bar */}
          <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
            {previous ? (
              <Link
                href={`/lessons/${previous.documentId}`}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <ArrowLeft className="size-3.5" />
                <span>Previous: {previous.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {/* Next Lesson or Quiz Trigger */}
            {next ? (
              isStudent && !completed ? (
                /* Disabled Next Button with Tooltip when current lesson is not completed */
                <div
                  title="Sequential Lock: Complete this lesson first to unlock the next lesson."
                  className="group relative inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed shadow-2xs"
                >
                  <Lock className="size-3.5 text-slate-400" />
                  <span>Next: {next.title}</span>
                  <span className="hidden sm:inline text-[11px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded ml-1">
                    Complete current first
                  </span>
                </div>
              ) : (
                /* Unlocked Next Button */
                <Link
                  href={`/lessons/${next.documentId}`}
                  className="brand-gradient inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:opacity-95 hover:shadow active:translate-y-0.5"
                >
                  <span>Next: {next.title}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              )
            ) : isLastLesson && course?.quiz ? (
              /* If last lesson and course has quiz, trigger assessment */
              <Link
                href={`/quizzes/${course.quiz.documentId}`}
                className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
              >
                <Award className="size-4" />
                <span>Take Course Quiz Assessment →</span>
              </Link>
            ) : null}
          </nav>
        </article>

        {/* Right Sidebar: Syllabus Track Playlist (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-md border border-slate-200/90 bg-white p-5 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
              <span className="flex items-center gap-2">
                <BookOpen className="size-4 text-brand-600" />
                <span>Course Track</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">{siblings.length} lessons</span>
            </h3>

            <div className="space-y-1.5">
              {siblings.map((item, index) => {
                const isCurrent = item.documentId === documentId;

                return (
                  <Link
                    key={item.documentId}
                    href={`/lessons/${item.documentId}`}
                    className={`flex items-center gap-2.5 rounded-md p-2.5 text-xs transition-all ${
                      isCurrent
                        ? 'bg-brand-50 text-brand-900 font-bold border border-brand-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded font-bold text-[10px] ${
                        isCurrent
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span className="truncate flex-1">{item.title}</span>
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
