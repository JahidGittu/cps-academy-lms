'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Alert, Button, Field, TextField } from '@/components/ui';

export type CourseValues = { title: string; description: string; coverImageUrl: string };

const SAMPLES = [
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

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Sparkles className="size-3 text-brand-600" />
            <span>Preset covers:</span>
          </span>
          {SAMPLES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => setValues((prev) => ({ ...prev, coverImageUrl: sample.url }))}
              className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition border border-slate-200"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {values.coverImageUrl && (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2.5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <ImageIcon className="size-3.5 text-brand-600" />
            <span>Thumbnail Live Preview</span>
          </p>
          <div className="relative h-44 w-full overflow-hidden rounded bg-slate-900 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={values.coverImageUrl}
              alt="Course Cover Preview"
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
