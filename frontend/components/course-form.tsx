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

export const CourseForm = ({
  course,
  save,
  label,
}: {
  course?: Course;
  save: (values: CourseValues) => Promise<void>;
  label: string;
}) => {
  const getInitialCover = (c?: Course) =>
    c?.coverImageUrl || (c?.title ? DEFAULT_COVERS[c.title] : '') || '';

  const getSnapshot = (c?: Course): CourseValues => ({
    title: c?.title ?? '',
    description: c?.description ?? '',
    coverImageUrl: getInitialCover(c),
  });

  const [values, setValues] = useState<CourseValues>(() => getSnapshot(course));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

  // Keep a record of the last confirmed saved server state to prevent false dirty states & loops
  const lastSavedRef = useRef<CourseValues>(getSnapshot(course));
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const latestValues = useRef(values);
  latestValues.current = values;

  // Sync state if course prop updates externally without triggering fake dirty save
  useEffect(() => {
    if (course) {
      const snapshot = getSnapshot(course);
      lastSavedRef.current = snapshot;
      setValues(snapshot);
      setSaveStatus('idle');
    }
  }, [course?.documentId, course?.updatedAt]);

  // Check if form has actual unsaved modifications compared to server
  const isDirty =
    Boolean(course) &&
    (values.title !== lastSavedRef.current.title ||
      values.description !== lastSavedRef.current.description ||
      values.coverImageUrl !== lastSavedRef.current.coverImageUrl);

  // Auto-Save ONLY when the user has made actual unsaved changes (1500ms debounce)
  useEffect(() => {
    if (!course || !isDirty || !values.title.trim()) {
      if (!isDirty && saveStatus === 'unsaved') {
        setSaveStatus('idle');
      }
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
        await save(latestValues.current);
        lastSavedRef.current = { ...latestValues.current };
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
  }, [values.title, values.description, values.coverImageUrl, isDirty, course]);

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
      lastSavedRef.current = { ...values };
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (caught) {
      setError(errorMessage(caught));
      setSaveStatus('idle');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Header with Live Auto-Save Status */}
      <div className="flex items-center justify-between border-b border-subtle pb-3">
        <h2 className="text-sm font-bold text-primary">
          {course ? 'Course Overview & Settings' : 'Create New Course'}
        </h2>

        {course && (
          <div className="text-xs">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-brand animate-pulse">
                <RefreshCw className="size-3 animate-spin" />
                <span>Auto-saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-500">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'unsaved' && isDirty && (
              <span className="inline-flex items-center gap-1.5 text-amber-500 font-medium">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes</span>
              </span>
            )}
            {saveStatus === 'idle' && !isDirty && (
              <span className="inline-flex items-center gap-1 text-muted text-[11px]">
                <span>✓ Up to date</span>
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
      />

      <Alert>{error}</Alert>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={busy || (Boolean(course) && !isDirty && saveStatus !== 'saving')}
          className="w-full sm:w-auto"
        >
          {busy ? 'Saving Course...' : label}
        </Button>

        {course && !isDirty && (
          <span className="text-xs font-medium text-muted">
            All changes synced
          </span>
        )}
      </div>
    </form>
  );
};
