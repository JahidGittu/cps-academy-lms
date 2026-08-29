'use client';

import Link from 'next/link';
import { ClipboardList, Plus, SquarePen, HelpCircle, CheckCircle2 } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Course, Quiz, Single } from '@/lib/types';
import { Alert, Card, LoadingState } from '@/components/ui';

const Preview = ({ documentId }: { documentId: string }) => {
  const quiz = useApi<Single<Quiz>>(`/quizzes/${documentId}?populate=questions`);

  if (quiz.loading) {
    return <LoadingState />;
  }

  if (quiz.error) return <Alert>{quiz.error}</Alert>;

  const questions = quiz.data?.data.questions ?? [];

  return (
    <Card className="border border-theme">
      <div className="flex items-center justify-between border-b border-subtle pb-3 mb-4">
        <div>
          <h2 className="font-bold text-base text-primary flex items-center gap-2">
            <HelpCircle className="size-5 text-sky-400" />
            <span>{quiz.data?.data.title}</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">{questions.length} Multiple Choice Assessment Questions</p>
        </div>
        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="size-3.5" />
          <span>Active Assessment</span>
        </span>
      </div>

      <ol className="space-y-2.5">
        {questions.map((question, index) => (
          <li key={question.id} className="flex items-center gap-3 rounded-xl bg-canvas p-3 text-xs sm:text-sm border border-theme">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-elevated text-xs font-bold text-primary">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-primary font-medium">{question.text}</span>
            <span className="shrink-0 rounded-md bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[11px] font-bold text-sky-400">
              {question.options.length} Options
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
};

export const QuizPanel = ({ course }: { course: Course }) => (
  <div className="space-y-5">
    {/* Studio Header Strip */}
    <div className="rounded-xl border border-theme bg-surface p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-primary flex items-center gap-2.5">
          <HelpCircle className="size-6 text-sky-400" />
          <span>Course Quiz Assessment</span>
        </h1>
        <p className="text-xs text-muted mt-1">
          End-of-course MCQ knowledge evaluation &bull; Server-side auto grading with instant score results.
        </p>
      </div>

      <Link
        href={`/courses/${course.documentId}/quiz`}
        className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-sky-600/25 hover:shadow-sky-500/35 transition-all"
      >
        {course.quiz ? <SquarePen className="size-4" /> : <Plus className="size-4" />}
        <span>{course.quiz ? 'Edit Quiz Questions' : 'Build Course Quiz'}</span>
      </Link>
    </div>

    {course.quiz ? (
      <Preview documentId={course.quiz.documentId} />
    ) : (
      <Card className="text-center p-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
          <ClipboardList className="size-6" />
        </span>

        <h3 className="mt-3 text-base font-bold text-primary">No Quiz Added Yet</h3>
        <p className="mt-1 text-xs text-muted max-w-md mx-auto">
          Add an end-of-course quiz with multiple-choice questions to test students after completing all syllabus lessons.
        </p>
        <Link
          href={`/courses/${course.documentId}/quiz`}
          className="inline-flex items-center gap-1.5 mt-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 text-xs font-bold shadow-md transition"
        >
          <Plus className="size-3.5" />
          <span>Add Assessment Quiz</span>
        </Link>
      </Card>
    )}
  </div>
);
