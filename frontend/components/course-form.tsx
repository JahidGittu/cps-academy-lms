'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { errorMessage } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Alert, Button, Field, TextField } from '@/components/ui';
import { ImagePicker } from '@/components/image-picker';

export type CourseValues = { title: string; description: string; coverImageUrl: string };

const COURSE_PRESETS = [
  { label: 'Database / SQL', url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Backend Servers', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80' },
  { label: 'Software Code', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80' },
  { label: 'System Architecture', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80' },
];

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
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Field 
        label="Course Title" 
        value={values.title} 
        onChange={set('title')} 
        placeholder="e.g. Modern Full-Stack Development"
        required 
      />

      <TextField 
        label="Course Description" 
        value={values.description} 
        onChange={set('description')} 
        placeholder="Brief summary of syllabus and learning objectives..."
      />

      {/* Dual Upload & URL Image Picker */}
      <ImagePicker
        label="Course Thumbnail / Cover Image"
        value={values.coverImageUrl}
        onChange={(url) => setValues((prev) => ({ ...prev, coverImageUrl: url }))}
        presets={COURSE_PRESETS}
      />

      <Alert>{error}</Alert>

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? 'Saving Course...' : label}
      </Button>
    </form>
  );
};
