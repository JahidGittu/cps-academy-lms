'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Course, QuizKey, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Empty, LoadingState } from '@/components/ui';
import { QuizBuilder } from './builder';
import { blankQuestion } from './question-fields';

const DeleteQuiz = ({ quiz, course }: { quiz: string; course: string }) => {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    if (!window.confirm('Delete this quiz? Past attempts and their scores go with it.')) return;

    setBusy(true);
    setError('');

    try {
      await api.delete(`/quizzes/${quiz}`);
      router.push(`/courses/${course}/edit`);
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-slate-200 pt-6">
      <Alert>{error}</Alert>

      <Button variant="danger" disabled={busy} onClick={remove}>
        Delete quiz
      </Button>
    </div>
  );
};

const Screen = ({ documentId }: { documentId: string }) => {
  const course = useApi<Single<Course>>(`/courses/${documentId}`);

  const detail = course.data?.data;
  const quiz = detail?.quiz?.documentId;

  const key = useApi<Single<QuizKey>>(quiz ? `/quizzes/${quiz}/answers` : null);

  if (course.loading || key.loading) {
    return (
      <LoadingState
        message="Loading quiz editor..."
        subtext="Retrieving questions and answer keys."
      />
    );
  }

  if (course.error) return <Alert>{course.error}</Alert>;

  if (!detail) return <Empty>This course does not exist.</Empty>;

  if (!detail.owned) return <Empty>This course belongs to someone else.</Empty>;

  const answers = key.data?.data;

  return (
    <div className="space-y-6">
      <Link
        href={`/courses/${documentId}/edit`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        {detail.title}
      </Link>

      <QuizBuilder
        course={documentId}
        quiz={quiz}
        title={answers?.title ?? `${detail.title} check`}
        questions={answers?.questions ?? [blankQuestion()]}
        onSaved={async () => {
          await course.reload();
          await key.reload();
        }}
      />

      {quiz && <DeleteQuiz quiz={quiz} course={documentId} />}
    </div>
  );
};

export default function CourseQuizPage() {
  const params = useParams<{ documentId: string }>();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Quiz</h1>

      <RequireAuth roles={['Instructor', 'Content Manager', 'Admin']}>
        <Screen documentId={params.documentId} />
      </RequireAuth>
    </div>
  );
}
