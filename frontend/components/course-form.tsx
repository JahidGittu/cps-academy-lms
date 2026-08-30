'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { CheckCircle2, RefreshCw, Sparkles, BookOpen } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Alert, Button, Field, TextField } from '@/components/ui';
import { ImagePicker } from '@/components/image-picker';

export type CourseValues = {
  title: string;
  description: string;
  coverImageUrl: string;
};

export const CourseForm = ({
  course,
  save,
  label,
  onNext,
}: {
  course?: Course;
  save: (values: CourseValues) => Promise<void>;
  label: string;
  onNext?: () => void;
}) => {
  const getSnapshot = (c?: Course): CourseValues => ({
    title: c?.title ?? '',
    description: c?.description ?? '',
    coverImageUrl: c?.coverImageUrl ?? '',
  });

  const [values, setValues] = useState<CourseValues>(() => getSnapshot(course));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

  const lastSavedRef = useRef<CourseValues>(getSnapshot(course));
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const latestValues = useRef(values);
  latestValues.current = values;

  // Sync state if course prop updates without triggering false dirty save
  useEffect(() => {
    const snapshot = getSnapshot(course);
    lastSavedRef.current = snapshot;
    setValues(snapshot);
    setSaveStatus('idle');
  }, [course?.documentId, course?.id]);

  const isDirty =
    Boolean(course) &&
    (values.title !== lastSavedRef.current.title ||
      values.description !== lastSavedRef.current.description ||
      values.coverImageUrl !== lastSavedRef.current.coverImageUrl);

  // Debounced auto-save ONLY when actual unsaved changes exist (1500ms debounce)
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
    }, 1000);

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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
            <BookOpen className="size-5 text-sky-400" />
            <span>{course ? 'Course Information & Metadata' : 'Create New Course'}</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Configure the course core title, comprehensive description, and public cover thumbnail.
          </p>
        </div>

        {course && (
          <div className="text-xs">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-400 animate-pulse">
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Saving changes...</span>
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
        )}
      </div>

      {/* 2-Column Responsive Layout Matching Studio Mockup */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Core Info (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          <Field
            label="Course Title"
            value={values.title}
            onChange={set('title')}
            placeholder="e.g. Modern Full-Stack Cloud Architecture & Microservices"
            required
          />

          <TextField
            label="Course Description & Curriculum Overview"
            value={values.description}
            onChange={set('description')}
            placeholder="Provide a detailed overview of what students will learn, real-world projects built, and prerequisites..."
            rows={7}
          />
        </div>

        {/* Right Column: Media & Thumbnail (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <ImagePicker
            label="Course Thumbnail / Cover Image"
            value={values.coverImageUrl}
            category="course"
            onChange={(url) => setValues((prev) => ({ ...prev, coverImageUrl: url }))}
          />
        </div>
      </div>

      <Alert>{error}</Alert>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-4">
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={busy || saveStatus === 'saving' || (Boolean(course) && !isDirty && saveStatus !== 'saving')}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 shadow-md shadow-sky-600/20 hover:shadow-sky-500/30 transition-all inline-flex items-center gap-2"
          >
            {(busy || saveStatus === 'saving') && (
              <RefreshCw className="size-3.5 animate-spin" />
            )}
            {busy || saveStatus === 'saving' ? 'Saving...' : label}
          </Button>
        </div>

        {/* Right side: Next button when provided, otherwise autosave status */}
        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-sky-600/25 transition cursor-pointer"
          >
            Next: Curriculum →
          </button>
        ) : course && (
          <div className="text-xs">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1.5 font-bold text-sky-400 animate-pulse">
                <RefreshCw className="size-3.5 animate-spin text-sky-400" />
                <span>Auto-saving changes to cloud...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>All changes saved & synced</span>
              </span>
            )}
            {saveStatus === 'unsaved' && isDirty && (
              <span className="inline-flex items-center gap-1.5 font-medium text-amber-400">
                <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Unsaved changes (auto-saving...)</span>
              </span>
            )}
            {saveStatus === 'idle' && !isDirty && (
              <span className="inline-flex items-center gap-1 text-muted font-medium">
                <span>✓ All changes synced</span>
              </span>
            )}
          </div>
        )}
      </div>
    </form>
  );
};
