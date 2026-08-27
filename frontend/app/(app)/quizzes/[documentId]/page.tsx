'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Award, CheckCircle2, Send } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Quiz, QuizResult, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Card, Empty } from '@/components/ui';

const optionLabel = 'ABCDEFGH';

const quizQuery = (documentId: string) =>
  `/quizzes/${documentId}?populate[questions]=true&populate[course][fields]=title`;

const attemptsQuery = (documentId: string) =>
  `/quiz-results?filters[quiz][documentId][$eq]=${documentId}&sort=createdAt:desc`;

const Taking = ({ documentId }: { documentId: string }) => {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  const [picked, setPicked] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const quiz = useApi<Single<Quiz>>(quizQuery(documentId));
  const attempts = useApi<Collection<QuizResult>>(isStudent ? attemptsQuery(documentId) : null);

  const questions = quiz.data?.data?.questions ?? [];
  const lastAttempt = attempts.data?.data?.[0];

  const submit = async () => {
    setBusy(true);
    setActionError('');

    try {
      const answers = questions.map((_, index) => picked[index] ?? -1);

      await api.post('/quiz-results', { data: { quiz: documentId, answers } });
      await attempts.reload();
      setPicked({});
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  if (quiz.loading) return <p className="text-sm text-slate-500">Loading quiz...</p>;

  if (quiz.status === 404) {
    return <Empty>This quiz belongs to a course you have not enrolled in.</Empty>;
  }

  if (quiz.error) return <Alert>{quiz.error}</Alert>;

  const detail = quiz.data?.data;

  if (!detail) return <Empty>This quiz is not available.</Empty>;

  const course = detail.course;
  const answered = Object.keys(picked).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{detail.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{questions.length} MCQ {questions.length === 1 ? 'Question' : 'Questions'} · Instant Auto-Grading</p>
      </div>

      {lastAttempt && (
        <Card className="brand-gradient-subtle border-brand-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
                <Award className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Latest Score: <span className="text-brand-700 font-bold text-base">{lastAttempt.score} / {lastAttempt.total}</span> ({Math.round((lastAttempt.score / lastAttempt.total) * 100)}%)
                </p>
                <p className="text-xs text-slate-500">
                  Submitted on {new Date(lastAttempt.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="size-3.5" />
              <span>Graded</span>
            </span>
          </div>
        </Card>
      )}

      {!questions.length && <Empty>This quiz has no questions added yet.</Empty>}

      {questions.map((question, index) => (
        <Card key={question.id} className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
              {index + 1}
            </span>
            <p className="font-semibold text-slate-900 text-base leading-snug pt-0.5">
              {question.text}
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {question.options.map((option, choice) => {
              const isSelected = picked[index] === choice;
              return (
                <label
                  key={choice}
                  className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/70 text-brand-900 shadow-xs ring-2 ring-brand-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    checked={isSelected}
                    disabled={!isStudent}
                    onChange={() => setPicked((prev) => ({ ...prev, [index]: choice }))}
                    className="accent-brand-600 size-4"
                  />

                  <span className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                    isSelected ? 'bg-brand-200 text-brand-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {optionLabel[choice]}
                  </span>

                  <span className="flex-1">{option}</span>
                </label>
              );
            })}
          </div>
        </Card>
      ))}

      <Alert>{actionError}</Alert>

      {isStudent && questions.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-500 font-medium">
            {answered} of {questions.length} answered
          </p>

          <Button disabled={busy || answered === 0} onClick={submit} className="gap-2">
            <Send className="size-4" />
            <span>{busy ? 'Evaluating Answers...' : 'Submit Answers'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default function QuizPage() {
  const params = useParams<{ documentId: string }>();

  return (
    <RequireAuth>
      <Taking documentId={params.documentId} />
    </RequireAuth>
  );
}
