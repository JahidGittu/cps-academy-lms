'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Markdown from 'react-markdown';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Lesson, LessonProgress, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Empty } from '@/components/ui';

// The lesson, the course it sits in so there is a way back, and the sibling titles so there is a
// next button. Titles only for the siblings: this page needs one body, not the whole course.
const lessonQuery = (documentId: string) =>
  `/lessons/${documentId}?populate[course][fields]=title` +
  `&populate[course][populate][lessons][fields]=title,order` +
  `&populate[course][populate][lessons][sort]=order:asc`;

// Only YouTube is worth special casing, since that is what a course author will paste. Anything
// else stays a link rather than being forced into an iframe.
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

  if (lesson.loading) return <p className="text-sm text-slate-500">Loading lesson</p>;

  // A lesson in a course the student has not enrolled in answers 404, not 403, so that the status
  // code cannot be used to find out what a closed course contains. That makes a closed lesson and
  // a deleted one look the same from here, so the wording covers both.
  if (lesson.status === 404) {
    return (
      <Empty>
        This lesson is not open to you. It may have been removed, or it belongs to a course you have
        not enrolled in.
      </Empty>
    );
  }

  if (lesson.error) return <Alert>{lesson.error}</Alert>;

  const detail = lesson.data?.data;

  if (!detail) return <Empty>This lesson is not available.</Empty>;

  const course = detail.course;
  const siblings = course?.lessons ?? [];
  const at = siblings.findIndex((row) => row.documentId === documentId);
  const previous = at > 0 ? siblings[at - 1] : null;
  const next = at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : null;
  const embed = detail.videoUrl ? embedUrl(detail.videoUrl) : null;

  return (
    <article className="space-y-6">
      {course && (
        <Link
          href={`/courses/${course.documentId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          {course.title}
        </Link>
      )}

      <h1 className="text-2xl font-semibold">{detail.title}</h1>

      {embed ? (
        <iframe
          src={embed}
          title={detail.title}
          allowFullScreen
          className="aspect-video w-full rounded-lg border border-slate-200"
        />
      ) : (
        detail.videoUrl && (
          <a href={detail.videoUrl} className="text-sm text-slate-900 underline">
            Watch the video
          </a>
        )
      )}

      {detail.content && (
        <div className="prose prose-slate max-w-none">
          <Markdown>{detail.content}</Markdown>
        </div>
      )}

      <Alert>{actionError}</Alert>

      {isStudent && (
        <div className="border-t border-slate-200 pt-5">
          {completed ? (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="size-4" />
              Completed
            </p>
          ) : (
            <Button disabled={busy} onClick={markDone}>
              Mark as complete
            </Button>
          )}
        </div>
      )}

      <nav className="flex justify-between gap-4 text-sm">
        {previous ? (
          <Link
            href={`/lessons/${previous.documentId}`}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            {previous.title}
          </Link>
        ) : (
          <span />
        )}

        {next && (
          <Link
            href={`/lessons/${next.documentId}`}
            className="flex items-center gap-1.5 text-right text-slate-600 hover:text-slate-900"
          >
            {next.title}
            <ArrowRight className="size-4 shrink-0" />
          </Link>
        )}
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
