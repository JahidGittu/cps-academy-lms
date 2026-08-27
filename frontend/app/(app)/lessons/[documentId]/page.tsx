'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Markdown from 'react-markdown';
import { ArrowLeft, ArrowRight, CheckCircle2, Play, Lock } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Lesson, LessonProgress, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Empty } from '@/components/ui';

const lessonQuery = (documentId: string) =>
  `/lessons/${documentId}?populate[course][fields]=title` +
  `&populate[course][populate][lessons][fields]=title,order` +
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
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-8 text-center max-w-lg mx-auto">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-3">
          <Lock className="size-6" />
        </span>
        <h2 className="text-lg font-bold text-amber-900">Sequential Lesson Locked</h2>
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
    <article className="space-y-8 max-w-4xl mx-auto">
      {course && (
        <Link
          href={`/courses/${course.documentId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to {course.title}</span>
        </Link>
      )}

      <div>
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Lesson {at + 1} of {siblings.length}</span>
        <h1 className="mt-1 text-3xl font-bold text-slate-900 tracking-tight">{detail.title}</h1>
      </div>

      {embed ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg">
          <iframe
            src={embed}
            title={detail.title}
            allowFullScreen
            className="aspect-video w-full"
          />
        </div>
      ) : (
        detail.videoUrl && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
            <Play className="size-5 text-brand-600" />
            <a href={detail.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-600 hover:underline">
              Open external video lesson ↗
            </a>
          </div>
        )
      )}

      {detail.content && (
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <Markdown>{detail.content}</Markdown>
        </div>
      )}

      <Alert>{actionError}</Alert>

      {isStudent && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div>
            <p className="text-sm font-semibold text-slate-900">Lesson Progress</p>
            <p className="text-xs text-slate-500">Mark completed to unlock subsequent course material.</p>
          </div>

          {completed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Completed</span>
            </span>
          ) : (
            <Button disabled={busy} onClick={markDone}>
              {busy ? 'Saving...' : 'Mark as Complete'}
            </Button>
          )}
        </div>
      )}

      <nav className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
        {previous ? (
          <Link
            href={`/lessons/${previous.documentId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <span>Next: {next.title}</span>
              <ArrowRight className="size-4" />
            </Link>
          ))}
      </nav>
    </article>
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
