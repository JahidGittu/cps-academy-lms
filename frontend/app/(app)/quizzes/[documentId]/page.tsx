'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Send,
  Lock,
  RotateCcw,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Quiz, QuizResult, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Card, Empty, LoadingState, ProgressBar } from '@/components/ui';

const optionLabel = 'ABCDEFGH';

const quizQuery = (documentId: string) =>
  `/quizzes/${documentId}?populate[questions]=true&populate[course][fields]=title,documentId`;

const attemptsQuery = (documentId: string) =>
  `/quiz-results?filters[quiz][documentId][$eq]=${documentId}&sort=createdAt:desc`;

const Taking = ({ documentId }: { documentId: string }) => {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);

  const quiz = useApi<Single<Quiz>>(quizQuery(documentId));
  const attempts = useApi<Collection<QuizResult>>(isStudent ? attemptsQuery(documentId) : null);

  const questions = quiz.data?.data?.questions ?? [];
  const lastAttempt = attempts.data?.data?.[0];

  const answeredCount = Object.keys(picked).length;
  const isLastQuestion = currentIndex === questions.length - 1;

  const submit = async () => {
    setBusy(true);
    setActionError('');

    try {
      const answers = questions.map((_, index) => picked[index] ?? -1);

      await api.post('/quiz-results', { data: { quiz: documentId, answers } });
      await attempts.reload();
      setJustSubmitted(true);
      setIsRetaking(false);
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const retake = () => {
    setPicked({});
    setCurrentIndex(0);
    setJustSubmitted(false);
    setIsRetaking(true);
    setActionError('');
  };

  if (quiz.loading) {
    return <LoadingState />;
  }

  if (quiz.status === 404) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/10 p-8 text-center shadow-xs">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Lock className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-primary">Quiz Assessment Locked</h2>
        <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
          This quiz belongs to a course you have not enrolled in yet. Please enroll in the course to take the quiz and get auto-graded.
        </p>
        <Link
          href="/courses"
          className="brand-gradient mt-5 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95"
        >
          <span>Explore Course Catalogue →</span>
        </Link>
      </div>
    );
  }

  if (quiz.error) return <Alert>{quiz.error}</Alert>;

  const detail = quiz.data?.data;
  if (!detail) return <Empty>This quiz is not available.</Empty>;

  const course = detail.course;
  const currentQuestion = questions[currentIndex];

  // If student has a previous attempt and is NOT currently retaking:
  if (lastAttempt && !isRetaking) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        {course && (
          <Link
            href={`/courses/${course.documentId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-500 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to {course.title}</span>
          </Link>
        )}

        <div className="rounded-xl border border-theme bg-surface p-6 sm:p-8 text-center shadow-sm space-y-5">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl brand-gradient text-white shadow-md">
            <Award className="size-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-primary">{detail.title}</h1>
            <p className="text-xs text-muted mt-1">Quiz Assessment Completed</p>
          </div>

          <div className="rounded-lg bg-elevated border border-subtle p-4">
            <p className="text-xs uppercase font-bold tracking-wider text-muted">Final Score</p>
            <p className="text-3xl font-extrabold text-brand-500 mt-1">
              {lastAttempt.score} <span className="text-base text-muted font-normal">/ {lastAttempt.total}</span>
            </p>
            <p className="text-xs font-semibold text-secondary mt-1">
              Accuracy: {Math.round((lastAttempt.score / lastAttempt.total) * 100)}%
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button variant="plain" onClick={retake} className="gap-2 text-xs py-2 px-4">
              <RotateCcw className="size-3.5" />
              <span>Retake Quiz</span>
            </Button>

            {course && (
              <Link
                href={`/courses/${course.documentId}`}
                className="brand-gradient inline-flex items-center gap-2 rounded-md px-5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95"
              >
                <span>Return to Course Outline</span>
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col justify-center space-y-4">
      {/* Top Breadcrumb & Quiz Title Combined Compact Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-subtle">
        <div className="flex items-center gap-2 min-w-0">
          {course && (
            <Link
              href={`/courses/${course.documentId}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-brand-500 transition-colors shrink-0"
            >
              <ArrowLeft className="size-3.5" />
              <span className="truncate max-w-[140px] sm:max-w-xs">{course.title}</span>
            </Link>
          )}
          <span className="text-subtle">/</span>
          <span className="text-xs sm:text-sm font-bold text-primary">Quiz</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-md bg-brand-500/10 border border-brand-500/30 px-2.5 py-0.5 text-xs font-bold text-brand-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      {!questions.length && <Empty>This quiz has no questions added yet.</Empty>}

      {/* Viewport-Optimized Single Question Box */}
      {questions.length > 0 && currentQuestion && (
        <div className="rounded-xl border border-theme bg-surface p-5 sm:p-6 shadow-sm space-y-4">
          {/* Step-by-Step Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span>
                Completed: <strong className="text-primary font-semibold">{currentIndex} of {questions.length}</strong>
              </span>
              <span>{Math.round((currentIndex / questions.length) * 100)}%</span>
            </div>
            <ProgressBar percent={Math.round((currentIndex / questions.length) * 100)} />
          </div>

          {/* Active Question Prompt */}
          <div className="pt-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-brand-500/15 text-xs font-bold text-brand-400">
                  {currentIndex + 1}
                </span>
                <h2 className="font-bold text-primary text-sm sm:text-base leading-snug">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Question Format Tag */}
              <span className="shrink-0 inline-flex items-center rounded-md bg-elevated border border-theme px-2 py-0.5 text-[11px] font-semibold text-secondary">
                Single Choice
              </span>
            </div>
          </div>

          {/* Compact MCQ Options: 2-Column Responsive Grid */}
          <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
            {currentQuestion.options.map((option, choice) => {
              const isSelected = picked[currentIndex] === choice;

              return (
                <label
                  key={choice}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/10 text-brand-400 shadow-2xs ring-2 ring-brand-500/20 font-semibold'
                      : 'border-theme bg-canvas text-secondary hover:border-active hover:bg-elevated'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentIndex}`}
                    checked={isSelected}
                    disabled={!isStudent}
                    onChange={() => setPicked((prev) => ({ ...prev, [currentIndex]: choice }))}
                    className="accent-brand-600 size-3.5"
                  />

                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded text-[11px] font-bold ${
                      isSelected ? 'bg-brand-600 text-white' : 'bg-elevated text-muted'
                    }`}
                  >
                    {optionLabel[choice]}
                  </span>

                  <span className="flex-1 leading-snug">{option}</span>
                </label>
              );
            })}
          </div>

          <Alert>{actionError}</Alert>

          {/* Integrated Compact Navigation Footer inside the Quiz Box */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-subtle">
            {/* Previous Button */}
            {currentIndex > 0 ? (
              <Button
                variant="plain"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="gap-1.5 px-3.5 py-1.5 text-xs font-bold"
              >
                <ArrowLeft className="size-3.5" />
                <span>Previous</span>
              </Button>
            ) : (
              <div />
            )}

            {/* Next or Submit Button */}
            {!isLastQuestion ? (
              <Button
                disabled={picked[currentIndex] === undefined}
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="gap-1.5 px-4 py-1.5 text-xs font-bold shadow-xs ml-auto"
              >
                <span>Next</span>
                <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button
                disabled={busy || picked[currentIndex] === undefined}
                onClick={submit}
                className="brand-gradient gap-1.5 px-5 py-2 text-xs font-bold text-white shadow-xs ml-auto hover:opacity-95"
              >
                <Send className="size-3.5" />
                <span>{busy ? 'Evaluating...' : 'Submit Answers ✓'}</span>
              </Button>
            )}
          </div>
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

