'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Alert, Button, Field, TextField } from '@/components/ui';

export type CourseValues = { title: string; description: string; coverImageUrl: string };

const SAMPLES = [
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
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
    <form onSubmit={submit} className="space-y-5">
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

      <div>
        <Field
          label="Thumbnail / Cover Image URL"
          value={values.coverImageUrl}
          onChange={set('coverImageUrl')}
          placeholder="https://images.unsplash.com/..."
        />

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="size-3 text-brand-600" />
          <span>Quick sample covers:</span>
          {SAMPLES.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setValues((prev) => ({ ...prev, coverImageUrl: url }))}
              className="text-brand-600 underline hover:text-brand-800"
            >
              Cover {i + 1}
            </button>
          ))}
        </div>
      </div>

      {values.coverImageUrl && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
          <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
            <ImageIcon className="size-3.5" />
            <span>Thumbnail Preview</span>
          </p>
          <div className="relative h-36 w-full overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={values.coverImageUrl}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      <Alert>{error}</Alert>

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? 'Saving Course...' : label}
      </Button>
    </form>
  );
};
