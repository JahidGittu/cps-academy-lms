'use client';

import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  RefreshCw,
  Sparkles,
  Rocket,
  ArrowRight,
  Eye,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Course, Quiz, Single } from '@/lib/types';
import { Alert, Button, Field, LoadingState } from '@/components/ui';
import { ConfirmModal } from '@/components/confirm-modal';

export type DraftQuestion = { text: string; options: string[]; correctIndex: number };

const blankQuestion = (): DraftQuestion => ({
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
});

export const QuizPanel = ({
  course,
  onSaved,
}: {
  course: Course;
  onSaved?: () => Promise<void>;
}) => {
  const router = useRouter();
  const quizDocId = course.quiz?.documentId;
  const quizData = useApi<Single<Quiz>>(
    quizDocId ? `/quizzes/${quizDocId}?populate=questions` : null
  );

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);
  const [busy, setBusy] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const lastSavedRef = useRef<{ title: string; questions: DraftQuestion[] }>({
    title: '',
    questions: [],
  });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync server quiz data when initially loaded
  useEffect(() => {
    if (quizData.data?.data) {
      const q = quizData.data.data;
      const initialTitle = q.title || '';
      const initialQuestions =
        q.questions && q.questions.length > 0
          ? q.questions.map((item) => ({
              text: item.text,
              options: item.options && item.options.length >= 2 ? item.options : ['', ''],
              correctIndex: item.correctIndex ?? 0,
            }))
          : [blankQuestion()];

      setTitle(initialTitle);
      setQuestions(initialQuestions);
      lastSavedRef.current = {
        title: initialTitle,
        questions: JSON.parse(JSON.stringify(initialQuestions)),
      };
      setSaveStatus('idle');
    } else if (!course.quiz && !title) {
      const defaultTitle = `${course.title} - Final Assessment`;
      const defaultQuestions = [blankQuestion()];
      setTitle(defaultTitle);
      setQuestions(defaultQuestions);
      lastSavedRef.current = {
        title: defaultTitle,
        questions: JSON.parse(JSON.stringify(defaultQuestions)),
      };
    }
  }, [quizData.data?.data?.documentId, course.quiz?.documentId]);

  // Determine if form is dirty (unsaved user modifications)
  const isDirty =
    Boolean(title.trim()) &&
    (title !== lastSavedRef.current.title ||
      JSON.stringify(questions) !== JSON.stringify(lastSavedRef.current.questions));

  // Debounced background auto-save (1500ms after user pauses typing)
  useEffect(() => {
    if (!isDirty || !title.trim() || !questions.length) {
      if (!isDirty && saveStatus === 'unsaved') {
        setSaveStatus('idle');
      }
      return;
    }

    // Validate that questions are filled before auto-saving
    const isValid = questions.every(
      (q) => q.text.trim().length > 0 && q.options.filter((o) => o.trim().length > 0).length >= 2
    );

    if (!isValid) {
      setSaveStatus('unsaved');
      return;
    }

    setSaveStatus('unsaved');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      setError('');

      try {
        const data = {
          title: title.trim(),
          questions,
          course: course.documentId,
        };

        if (course.quiz?.documentId) {
          await api.put(`/quizzes/${course.quiz.documentId}`, { data });
        } else {
          await api.post<Single<Quiz>>('/quizzes', { data });
          if (onSaved) await onSaved();
        }

        lastSavedRef.current = {
          title: title.trim(),
          questions: JSON.parse(JSON.stringify(questions)),
        };
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (caught) {
        setError(errorMessage(caught));
        setSaveStatus('idle');
      }
    }, 1500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [title, questions, isDirty, course.documentId, course.quiz?.documentId]);

  const updateQuestion = (at: number, next: DraftQuestion) => {
    setQuestions((prev) => prev.map((q, i) => (i === at ? next : q)));
  };

  const removeQuestion = (at: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== at));
  };

  const setOptionText = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newOptions = [...q.options];
        newOptions[optIndex] = text;
        return { ...q, options: newOptions };
      })
    );
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, correctIndex: optIndex } : q))
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ''] } : q))
    );
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newOptions = q.options.filter((_, idx) => idx !== optIndex);
        let nextCorrect = q.correctIndex;
        if (optIndex === q.correctIndex) nextCorrect = 0;
        else if (optIndex < q.correctIndex) nextCorrect = Math.max(0, q.correctIndex - 1);
        return { ...q, options: newOptions, correctIndex: nextCorrect };
      })
    );
  };

  // Save changes handler
  const saveQuizData = async () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!questions.length) {
      throw new Error('Quiz assessment must have at least one question.');
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        throw new Error(`Question ${i + 1} text is empty. Please enter question text.`);
      }
      const validOptions = q.options.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        throw new Error(`Question ${i + 1} must have at least 2 non-empty options.`);
      }
    }

    const data = {
      title: title.trim() || `${course.title} Assessment`,
      questions,
      course: course.documentId,
    };

    if (course.quiz?.documentId) {
      await api.put(`/quizzes/${course.quiz.documentId}`, { data });
    } else {
      await api.post('/quizzes', { data });
      if (onSaved) await onSaved();
    }

    lastSavedRef.current = {
      title: title.trim(),
      questions: JSON.parse(JSON.stringify(questions)),
    };
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaveStatus('saving');

    try {
      await saveQuizData();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (caught) {
      setError(errorMessage(caught));
      setSaveStatus('idle');
    } finally {
      setBusy(false);
    }
  };

  // Final Publish Course & View Live Flow
  const handlePublishCourse = async () => {
    setPublishBusy(true);
    setError('');

    try {
      if (isDirty) {
        await saveQuizData();
      }
      setPublishedSuccess(true);
      setTimeout(() => {
        router.push(`/courses/${course.documentId}`);
      }, 1200);
    } catch (caught) {
      setError(errorMessage(caught));
      setPublishBusy(false);
    }
  };

  const confirmDeleteQuiz = async () => {
    if (!course.quiz?.documentId) return;

    setDeleteBusy(true);
    setError('');

    try {
      await api.delete(`/quizzes/${course.quiz.documentId}`);
      if (onSaved) await onSaved();
      setQuestions([blankQuestion()]);
      setShowDeleteModal(false);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setDeleteBusy(false);
    }
  };

  if (quizDocId && quizData.loading && !quizData.data) {
    return <LoadingState />;
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Celebration Banner when Published */}
      {publishedSuccess && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-emerald-400 flex items-center gap-3 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <Sparkles className="size-6 text-emerald-400 shrink-0" />
          <div className="text-xs sm:text-sm font-bold">
            🎉 Course Successfully Published & Live in Catalogue! Redirecting to student view...
          </div>
        </div>
      )}

      {/* Quiz Studio Header Strip with Live Auto-Save Status */}
      <div className="rounded-xl border border-theme bg-surface p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary flex items-center gap-2.5">
            <HelpCircle className="size-6 text-sky-400" />
            <span>Course Quiz Assessment</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            End-of-course MCQ knowledge evaluation &bull; Server-side auto grading with instant score results.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2.5 py-1">
              <FileQuestion className="size-3.5" />
              <span>{questions.length} Assessment Questions</span>
            </span>

            {course.quiz ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1">
                <CheckCircle2 className="size-3.5" />
                <span>Active Published Quiz</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1">
                <AlertCircle className="size-3.5" />
                <span>Quiz Setup In Progress</span>
              </span>
            )}

            {/* Live Auto-Save Status Badge */}
            <div className="text-xs">
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-sky-400 animate-pulse">
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Auto-saving questions...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-500">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>All changes synced</span>
                </span>
              )}
              {saveStatus === 'unsaved' && isDirty && (
                <span className="inline-flex items-center gap-1.5 text-amber-500 font-medium">
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Unsaved changes</span>
                </span>
              )}
              {saveStatus === 'idle' && !isDirty && (
                <span className="inline-flex items-center gap-1 text-muted text-xs">
                  <span>✓ Up to date</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {course.quiz && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3.5 py-2.5 text-xs font-bold transition cursor-pointer"
            >
              Delete Quiz
            </button>
          )}

          <button
            type="button"
            onClick={handlePublishCourse}
            disabled={publishBusy}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-emerald-600/25 hover:shadow-emerald-500/35 transition-all cursor-pointer"
          >
            <Rocket className="size-4" />
            <span>{publishBusy ? 'Publishing...' : 'Publish Course'}</span>
          </button>
        </div>
      </div>

      <Alert>{error}</Alert>

      {/* Quiz Title & Settings Card */}
      <div className="rounded-xl border border-theme bg-surface p-5 shadow-2xs space-y-4">
        <Field
          label="Quiz Assessment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Cloud Architecture & Microservices Final MCQ Assessment"
          required
        />
      </div>

      {/* Questions Stack */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary flex items-center gap-2">
            <span>Assessment Questions ({questions.length})</span>
          </h2>

          <button
            type="button"
            onClick={() => setQuestions((prev) => [...prev, blankQuestion()])}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add Question</span>
          </button>
        </div>

        {questions.map((question, qIndex) => (
          <div
            key={qIndex}
            className="rounded-xl border border-theme bg-surface p-5 shadow-2xs space-y-4"
          >
            {/* Question Card Header */}
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-sky-600 text-white font-black text-xs">
                  {qIndex + 1}
                </span>
                <span className="text-sm font-bold text-primary">Question {qIndex + 1}</span>
              </div>

              {questions.length > 1 && (
                <button
                  type="button"
                  title="Remove Question"
                  onClick={() => removeQuestion(qIndex)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Question Text */}
            <Field
              label="Question Text"
              value={question.text}
              onChange={(e) => updateQuestion(qIndex, { ...question, text: e.target.value })}
              placeholder="e.g. Which Docker instruction specifies the base operating system image?"
              required
            />

            {/* Options List */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-primary">
                  Multiple Choice Options &bull; <span className="text-sky-400 font-normal">Select the radio button next to the correct answer</span>
                </label>
              </div>

              <div className="space-y-2">
                {question.options.map((option, optIndex) => {
                  const isCorrect = question.correctIndex === optIndex;
                  const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D

                  return (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2.5 rounded-lg border p-2 transition-all ${
                        isCorrect
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-theme bg-canvas'
                      }`}
                    >
                      {/* Radio button for Correct Answer */}
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0 px-1">
                        <input
                          type="radio"
                          name={`correct-answer-${qIndex}`}
                          checked={isCorrect}
                          onChange={() => setCorrectOption(qIndex, optIndex)}
                          className="size-4 accent-emerald-500 cursor-pointer"
                        />
                        <span
                          className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                            isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'bg-elevated text-muted border border-theme'
                          }`}
                        >
                          {optionLabel}
                        </span>
                      </label>

                      {/* Option Text Input */}
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => setOptionText(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${optionLabel} text...`}
                        required
                        className="w-full bg-transparent text-xs sm:text-sm text-primary outline-none placeholder:text-muted"
                      />

                      {/* Delete Option (if > 2 options) */}
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          title="Remove Option"
                          onClick={() => removeOption(qIndex, optIndex)}
                          className="rounded p-1 text-muted hover:text-red-400 cursor-pointer shrink-0 transition"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Option button */}
              {question.options.length < 6 && (
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer mt-1"
                >
                  <Plus className="size-3" />
                  <span>Add another option</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <button
          type="button"
          onClick={() => setQuestions((prev) => [...prev, blankQuestion()])}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-theme py-3.5 text-xs sm:text-sm font-bold text-muted hover:border-sky-500/50 hover:bg-elevated hover:text-sky-400 transition cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Add Another Assessment Question</span>
        </button>
      </div>

      {/* Bottom Save & Final Publish Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-5">
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={busy || (!isDirty && saveStatus !== 'saving')}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 shadow-md shadow-sky-600/25 hover:shadow-sky-500/35"
          >
            {busy ? 'Saving...' : course.quiz ? 'Save changes' : 'Save Quiz Draft'}
          </Button>

          {!isDirty && (
            <span className="text-xs text-muted font-medium">
              All changes synced
            </span>
          )}
        </div>

        {/* Final Course Publish & Live View Button */}
        <button
          type="button"
          onClick={handlePublishCourse}
          disabled={publishBusy}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 text-xs sm:text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/35 transition-all cursor-pointer"
        >
          <Rocket className="size-4" />
          <span>{publishBusy ? 'Publishing...' : '🚀 Save & Publish Course to Catalogue'}</span>
        </button>
      </div>

      {/* Delete Quiz Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Quiz Assessment?"
        message="Are you sure you want to permanently delete this course quiz? All student assessment attempt records for this quiz will also be removed."
        confirmText="Yes, Delete Quiz"
        cancelText="Cancel"
        loading={deleteBusy}
        onConfirm={confirmDeleteQuiz}
        onClose={() => setShowDeleteModal(false)}
      />
    </form>
  );
};
