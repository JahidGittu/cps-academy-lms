'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Alert, Button, Field, TextField } from '@/components/ui';
import { ImagePicker } from '@/components/image-picker';
import { DEFAULT_COVERS } from '@/components/course-cover';

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
  const initialCover = course?.coverImageUrl || (course?.title ? DEFAULT_COVERS[course.title] : '') || '';

  const [values, setValues] = useState<CourseValues>({
    title: course?.title ?? '',
    description: course?.description ?? '',
    coverImageUrl: initialCover,
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

  const isInitialMount = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const latestValues = useRef(values);
  latestValues.current = values;

  // Sync state if course prop updates
  useEffect(() => {
    if (course) {
      setValues({
        title: course.title ?? '',
        description: course.description ?? '',
        coverImageUrl: course.coverImageUrl || (course.title ? DEFAULT_COVERS[course.title] : '') || '',
      });
    }
  }, [course]);

  // Smooth Debounced Auto-Save for existing courses (1200ms debounce)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only auto-save if course already exists (editing mode) and title is not blank
    if (!course || !values.title.trim()) return;

    setSaveStatus('unsaved');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      setError('');

      try {
        await save(latestValues.current);
        setSaveStatus('saved');
      } catch (caught) {
        setError(errorMessage(caught));
        setSaveStatus('idle');
      }
    }, 1200);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [values.title, values.description, values.coverImageUrl, course]);

  const set =
    (field: keyof CourseValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setBusy(true);
    setError('');

    try {
      await save(values);
      setSaveStatus('saved');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Header with Live Auto-Save Status */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900">
          {course ? 'Course Overview & Settings' : 'Create New Course'}
        </h2>

        {course && (
          <div className="text-xs">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-brand-600 animate-pulse">
                <RefreshCw className="size-3 animate-spin" />
                <span>Auto-saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="size-1.5 rounded-full bg-amber-500" />
                <span>Unsaved changes</span>
              </span>
            )}
          </div>
        )}
      </div>

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
        rows={4}
      />

      {/* Dual Upload & URL Image Picker */}
      <ImagePicker
        label="Course Thumbnail / Cover Image"
        value={values.coverImageUrl}
        onChange={(url) => setValues((prev) => ({ ...prev, coverImageUrl: url }))}
        presets={COURSE_PRESETS}
      />

      <Alert>{error}</Alert>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy ? 'Saving Course...' : label}
        </Button>

        {course && saveStatus === 'saved' && (
          <span className="text-xs font-medium text-slate-500">
            ✓ All changes automatically synced
          </span>
        )}
      </div>
    </form>
  );
};
