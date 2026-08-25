'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { errorMessage } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Alert, Button, Field, TextField } from '@/components/ui';

export type CourseValues = { title: string; description: string; coverImageUrl: string };

// The new and the edit screen send the same three fields, so the fields live here and the request
// does not: one of them is a post and the other a put, and the page that knows which also knows
// where to go afterwards.
export const CourseForm = ({
  course,
  save,
  label,
}: {
  course?: Course;
  save: (values: CourseValues) => Promise<void>;
  label: string;
}) => {
  const [values, setValues] = useState<CourseValues>({
    title: course?.title ?? '',
    description: course?.description ?? '',
    coverImageUrl: course?.coverImageUrl ?? '',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set =
    (field: keyof CourseValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await save(values);
    } catch (caught) {
      setError(errorMessage(caught));
      // Only released on failure. A save that worked navigates away, and re-enabling the button
      // first invites a second click that would create the course twice.
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title" value={values.title} onChange={set('title')} required />

      <TextField label="Description" value={values.description} onChange={set('description')} />

      <Field
        label="Cover image URL"
        value={values.coverImageUrl}
        onChange={set('coverImageUrl')}
        placeholder="https://"
      />

      <Alert>{error}</Alert>

      <Button type="submit" disabled={busy}>
        {busy ? 'Saving' : label}
      </Button>
    </form>
  );
};
