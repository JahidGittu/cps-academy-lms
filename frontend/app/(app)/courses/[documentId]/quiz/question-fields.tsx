'use client';

import type { ChangeEvent } from 'react';

import { Button, Field, inputStyle } from '@/components/ui';

export type Draft = { text: string; options: string[]; correctIndex: number };

export const blankQuestion = (): Draft => ({ text: '', options: ['', ''], correctIndex: 0 });

// One question, edited in place. The radio is the answer key: whichever option it sits on is the
// index the grader compares an answer against, and it is the only place on the site that index is
// visible at all.
export const QuestionFields = ({
  index,
  draft,
  onChange,
  onRemove,
}: {
  index: number;
  draft: Draft;
  onChange: (next: Draft) => void;
  onRemove: () => void;
}) => {
  const setOption = (at: number) => (event: ChangeEvent<HTMLInputElement>) =>
    onChange({
      ...draft,
      options: draft.options.map((option, i) => (i === at ? event.target.value : option)),
    });

  // Dropping an option moves everything after it up a place, so the stored index has to move with
  // them. Left alone it would quietly start pointing at a different answer than the one ticked.
  const removeOption = (at: number) => {
    const correctIndex =
      at === draft.correctIndex
        ? 0
        : at < draft.correctIndex
          ? draft.correctIndex - 1
          : draft.correctIndex;

    onChange({ ...draft, options: draft.options.filter((_, i) => i !== at), correctIndex });
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">Question {index + 1}</span>

        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-600 underline hover:text-red-800"
        >
          Remove question
        </button>
      </div>

      <Field
        label="Question"
        value={draft.text}
        onChange={(event) => onChange({ ...draft, text: event.target.value })}
        required
      />

      <div className="space-y-2">
        <span className="block text-sm font-medium text-slate-700">
          Options, with the correct one ticked
        </span>

        {draft.options.map((option, at) => (
          <div key={at} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${index}`}
              checked={draft.correctIndex === at}
              onChange={() => onChange({ ...draft, correctIndex: at })}
              className="size-4 shrink-0"
              aria-label={`Option ${at + 1} is correct`}
            />

            <input
              value={option}
              onChange={setOption(at)}
              required
              aria-label={`Option ${at + 1}`}
              className={inputStyle}
            />

            {/* Two is the fewest a multiple choice question can have and still ask anything. */}
            {draft.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(at)}
                className="shrink-0 text-xs text-slate-500 underline hover:text-slate-900"
              >
                Drop
              </button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="plain"
          onClick={() => onChange({ ...draft, options: [...draft.options, ''] })}
        >
          Add option
        </Button>
      </div>
    </div>
  );
};
