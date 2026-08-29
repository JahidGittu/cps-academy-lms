'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { api, errorMessage } from '@/lib/api';
import { Alert, Button, Field } from '@/components/ui';
import { blankQuestion, QuestionFields, type Draft } from './question-fields';

// A save sends the whole question list
export const QuizBuilder = ({
  course,
  quiz,
  title: savedTitle,
  questions: savedQuestions,
  onSaved,
}: {
  course: string;
  quiz?: string;
  title: string;
  questions: Draft[];
  onSaved: () => Promise<void>;
}) => {
  const [title, setTitle] = useState(savedTitle);
  const [questions, setQuestions] = useState<Draft[]>(savedQuestions);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const replace = (at: number, next: Draft) =>
    setQuestions((prev) => prev.map((question, i) => (i === at ? next : question)));

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!questions.length) {
      setError('A quiz needs at least one question.');
      return;
    }

    setBusy(true);
    setError('');
    setSaved(false);

    try {
      const data = { title, questions, course };

      if (quiz) await api.put(`/quizzes/${quiz}`, { data });
      else await api.post('/quizzes', { data });

      await onSaved();
      setSaved(true);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="Quiz title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      {questions.map((draft, index) => (
        <QuestionFields
          key={index}
          index={index}
          draft={draft}
          onChange={(next) => replace(index, next)}
          onRemove={() => setQuestions((prev) => prev.filter((_, i) => i !== index))}
        />
      ))}

      <Button
        type="button"
        variant="plain"
        onClick={() => setQuestions((prev) => [...prev, blankQuestion()])}
      >
        Add question
      </Button>

      <Alert>{error}</Alert>

      <div className="flex items-center gap-3 border-t border-subtle pt-4">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving...' : 'Save quiz'}
        </Button>

        {saved && <span className="text-sm text-muted">Saved.</span>}
      </div>
    </form>
  );
};
