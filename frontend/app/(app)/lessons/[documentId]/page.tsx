'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Markdown from 'react-markdown';
import { ArrowLeft, ArrowRight, CheckCircle2, Play, Lock, BookOpen } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Lesson, LessonProgress, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Empty } from '@/components/ui';

const lessonQuery = (documentId: string) =>
  `/lessons/${documentId}?populate[course][fields]=title,documentId` +
  `&populate[course][populate][lessons][fields]=title,order,documentId` +
  `&populate[course][populate][lessons][sort]=order:asc`;

const embedUrl = (url: string) => {
  const id = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([\w-]{11})/);
  return id ? `https://www.youtube.com/embed/${id[1]}` : null;
};

const Viewer = ({ documentId }: { documentId: string }) => {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const lesson = useApi<Single<Lesson>>(lessonQuery(documentId));

  const progress = useApi<Collection<LessonProgress>>(
    isStudent ? `/lesson-progresses?filters[lesson][documentId][$eq]=${documentId}` : null
  );

  const completed = Boolean(progress.data?.data?.length);

  const markDone = async () => {
    setBusy(true);
    setActionError('');

    try {
      await api.post('/lesson-progresses', { data: { lesson: documentId } });
      await progress.reload();
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  if (lesson.loading) return <p className="text-sm text-slate-500">Loading lesson content...</p>;

  if (lesson.status === 404) {
    return (
      <Empty>
        <p className="font-semibold text-slate-800">Lesson unavailable</p>
        <p className="mt-1 text-sm text-slate-500">
          This lesson is either not enrolled or has been removed.
        </p>
      </Empty>
    );
  }

  if (lesson.status === 403) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-8 text-center max-w-lg mx-auto">
        <span className="inline-flex size-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mb-3">
          <Lock className="size-5" />
        </span>
        <h2 className="text-base font-bold text-amber-900">Sequential Lesson Locked</h2>
        <p className="mt-2 text-sm text-amber-800">
          You must complete earlier lessons before accessing this one.
        </p>
        <p className="mt-1 text-xs font-semibold text-amber-700">({lesson.error})</p>
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
  const embed = detail.videoUrl ? embedUrl(detail.videoUrl) : null;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={course ? `/courses/${course.documentId}` : '/courses'}
            className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>{course?.title ?? 'Courses'}</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900 truncate max-w-md">{detail.title}</span>
        </div>

        <span className="rounded-md bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-bold text-brand-700">
          Lesson {at + 1} of {siblings.length}
        </span>
      </div>

      {/* Main Grid: Content & Sidebar Playlist */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Lesson Content (8 cols) */}
        <article className="lg:col-span-8 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{detail.title}</h1>
          </div>

          {embed ? (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-black shadow-md">
              <iframe
                src={embed}
                title={detail.title}
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          ) : (
            detail.videoUrl && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
                <Play className="size-4 text-brand-600" />
                <a href={detail.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-semibold text-brand-600 hover:underline">
                  Watch External Video Lesson ↗
                </a>
              </div>
            )
          )}

          {detail.content && (
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed rounded-xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-xs">
              <Markdown>{detail.content}</Markdown>
            </div>
          )}

          <Alert>{actionError}</Alert>

          {isStudent && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div>
                <p className="text-sm font-semibold text-slate-900">Completion Status</p>
                <p className="text-xs text-slate-500">Mark complete to update your progress and unlock subsequent lessons.</p>
              </div>

              {completed ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Lesson Completed</span>
                </span>
              ) : (
                <Button disabled={busy} onClick={markDone}>
                  {busy ? 'Saving...' : 'Mark as Complete'}
                </Button>
              )}
            </div>
          )}

          {/* Navigation Bar */}
          <nav className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
            {previous ? (
              <Link
                href={`/lessons/${previous.documentId}`}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="size-4" />
                <span>Previous: {previous.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {next &&
              (isStudent && !completed ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Lock className="size-3.5" />
                  <span>Next lesson unlocks upon completion</span>
                </span>
              ) : (
                <Link
                  href={`/lessons/${next.documentId}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <span>Next: {next.title}</span>
                  <ArrowRight className="size-4" />
                </Link>
              ))}
          </nav>
        </article>

        {/* Course Syllabus Playlist Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
              <BookOpen className="size-4 text-brand-600" />
              <span>Course Syllabus</span>
            </h3>

            <div className="space-y-1.5">
              {siblings.map((item, index) => {
                const isCurrent = item.documentId === documentId;
                return (
                  <Link
                    key={item.documentId}
                    href={`/lessons/${item.documentId}`}
                    className={`flex items-center gap-2.5 rounded-lg p-2.5 text-xs transition-all ${
                      isCurrent
                        ? 'bg-brand-50 text-brand-900 font-bold border border-brand-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded font-bold text-[10px] ${
                      isCurrent ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
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
