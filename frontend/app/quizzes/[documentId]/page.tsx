'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Quiz, QuizResult, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Card, Empty } from '@/components/ui';

const optionLabel = 'ABCDEFGH';

// Naming populate at all means naming all of it, so questions has to be asked for even though it is
// a component rather than a relation. The answer key is not in the response either way: correctIndex
// is private in the Strapi schema.
const quizQuery = (documentId: string) =>
  `/quizzes/${documentId}?populate[questions]=true&populate[course][fields]=title`;

// Past attempts, newest first, so the score box below can show the last one.
const attemptsQuery = (documentId: string) =>
  `/quiz-results?filters[quiz][documentId][$eq]=${documentId}&sort=createdAt:desc`;

const Taking = ({ documentId }: { documentId: string }) => {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  // Keyed by question index, because that is the position the server grades against. A Map would
  // work too but this reads straight into the answers array below.
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
      // Sent as a dense array so answers[i] lines up with question i. A question left blank sends
      // -1, which cannot match an option index and so is graded wrong rather than skipped.
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

  if (quiz.loading) return <p className="text-sm text-slate-500">Loading quiz</p>;

  if (quiz.status === 404) {
    return <Empty>This quiz belongs to a course you have not enrolled in.</Empty>;
  }

  if (quiz.error) return <Alert>{quiz.error}</Alert>;

  const detail = quiz.data?.data;

  if (!detail) return <Empty>This quiz is not available.</Empty>;

  const course = detail.course;
  const answered = Object.keys(picked).length;

  return (
    <div className="space-y-6">
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

      {lastAttempt && (
        <Card>
          <p className="text-sm">
            Last attempt: <span className="font-medium">{lastAttempt.score}</span> out of{' '}
            {lastAttempt.total}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {new Date(lastAttempt.createdAt).toLocaleString()}
            {attempts.data && attempts.data.data.length > 1
              ? ` · ${attempts.data.data.length} attempts so far`
              : ''}
          </p>
        </Card>
      )}

      {!questions.length && <Empty>This quiz has no questions yet.</Empty>}

      {/* Read only for the roles that write quizzes. They can see the questions from the course they
          run, but taking a quiz is a Student action and the server refuses the post either way. */}
      {questions.map((question, index) => (
        <Card key={question.id}>
          <p className="font-medium">
            {index + 1}. {question.text}
          </p>

          <div className="mt-3 space-y-2">
            {question.options.map((option, choice) => (
              <label
                key={choice}
                className={`flex cursor-pointer items-center gap-3 rounded border px-3 py-2 text-sm ${
                  picked[index] === choice
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  checked={picked[index] === choice}
                  disabled={!isStudent}
                  onChange={() => setPicked((prev) => ({ ...prev, [index]: choice }))}
                  className="accent-slate-900"
                />

                <span className="w-4 text-slate-400">{optionLabel[choice]}</span>
                {option}
              </label>
            ))}
          </div>
        </Card>
      ))}

      <Alert>{actionError}</Alert>

      {isStudent && questions.length > 0 && (
        <div className="flex items-center gap-4 border-t border-slate-200 pt-5">
          <Button disabled={busy || answered === 0} onClick={submit}>
            {busy ? 'Marking' : 'Submit answers'}
          </Button>

          <p className="text-sm text-slate-500">
            {answered} of {questions.length} answered
          </p>
        </div>
      )}

      {isStudent && attempts.data && attempts.data.data.length > 1 && (
        <section>
          <h2 className="mb-3 text-lg font-medium">Earlier attempts</h2>

          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {attempts.data.data.slice(1).map((attempt) => (
              <li
                key={attempt.documentId}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600"
              >
                {attempt.score === attempt.total ? (
                  <Check className="size-4 shrink-0" />
                ) : (
                  <X className="size-4 shrink-0 text-slate-400" />
                )}

                <span className="flex-1">
                  {attempt.score} out of {attempt.total}
                </span>

                <span className="text-xs text-slate-400">
                  {new Date(attempt.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
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
