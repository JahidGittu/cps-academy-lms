'use client';

import Link from 'next/link';
import { ClipboardList, Plus, SquarePen } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Course, Quiz, Single } from '@/lib/types';
import { Alert, Card, LoadingState, buttonStyle } from '@/components/ui';

// Read-only on purpose. Writing a quiz is its own screen because the options and the answer key need
// the room, and the key comes from a route of its own that this summary has no business calling.
const Preview = ({ documentId }: { documentId: string }) => {
  const quiz = useApi<Single<Quiz>>(`/quizzes/${documentId}?populate=questions`);

  if (quiz.loading) {
    return <LoadingState />;
  }

  if (quiz.error) return <Alert>{quiz.error}</Alert>;

  const questions = quiz.data?.data.questions ?? [];

  return (
    <Card>
      <h2 className="font-medium">{quiz.data?.data.title}</h2>
      <p className="text-sm text-slate-500">{questions.length} questions</p>

      <ol className="mt-4 space-y-2">
        {questions.map((question, index) => (
          <li key={question.id} className="flex gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="text-slate-400">{index + 1}</span>
            <span className="min-w-0 flex-1">{question.text}</span>
            <span className="shrink-0 text-xs text-slate-500">
              {question.options.length} options
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
};

export const QuizPanel = ({ course }: { course: Course }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-600">
        One quiz per course, marked on the server. Students sit it once the lessons are done.
      </p>

      <Link href={`/courses/${course.documentId}/quiz`} className={buttonStyle()}>
        {course.quiz ? <SquarePen className="size-4" /> : <Plus className="size-4" />}
        {course.quiz ? 'Edit quiz' : 'Write the quiz'}
      </Link>
    </div>

    {course.quiz ? (
      <Preview documentId={course.quiz.documentId} />
    ) : (
      <Card className="text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <ClipboardList className="size-5" />
        </span>

        <p className="mt-3 text-sm text-slate-500">
          No quiz on this course yet. Without one there is nothing to mark at the end.
        </p>
      </Card>
    )}
  </div>
);
