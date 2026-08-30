'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { useApi } from '@/lib/use-api';
import type { Course, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Empty, Skeleton } from '@/components/ui';
import { useSetBreadcrumbs } from '@/components/dashboard-shell';
import { BuilderNav, type Section } from './builder-nav';
import { CourseDetails } from './course-details';
import { LessonManager } from './lesson-manager';
import { QuizPanel } from './quiz-panel';

const Builder = ({ documentId }: { documentId: string }) => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const validTab: Section = tabParam === 'lessons' || tabParam === 'quiz' ? tabParam : 'details';

  const course = useApi<Single<Course>>(`/courses/${documentId}`);

  // Maintain active tab from URL query param (?tab=details / ?tab=lessons / ?tab=quiz)
  const [section, setSectionState] = useState<Section>(validTab);

  // Sync state if URL search param updates
  useEffect(() => {
    if (tabParam === 'lessons' || tabParam === 'quiz' || tabParam === 'details') {
      setSectionState(tabParam);
    }
  }, [tabParam]);

  const setSection = (next: Section) => {
    setSectionState(next);
    // Persist active tab in browser URL without full-page reloads
    const url = `/courses/${documentId}/edit?tab=${next}`;
    window.history.replaceState(null, '', url);
  };

  const detail = course.data?.data;

  useSetBreadcrumbs(
    detail
      ? [
          { label: 'Courses', href: '/admin/course-management' },
          { label: detail.title },
        ]
      : [{ label: 'Courses', href: '/admin/course-management' }, { label: 'Course Builder' }]
  );

  if (course.loading && !course.data) {
    return (
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start animate-in fade-in duration-200">
        <BuilderNav
          section={validTab}
          lessons={0}
          hasQuiz={false}
          courseId={documentId}
          onSelect={() => {}}
        />
        <div className="rounded-xl border border-theme bg-surface p-6 shadow-xs space-y-4">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      </div>
    );
  }

  if (course.error) return <Alert>{course.error}</Alert>;

  if (!detail) return <Empty>This course does not exist.</Empty>;

  if (!detail.owned) return <Empty>This course belongs to someone else.</Empty>;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
      <BuilderNav
        section={section}
        lessons={detail.lessons?.length ?? 0}
        hasQuiz={Boolean(detail.quiz)}
        courseId={documentId}
        courseTitle={detail.title}
        onSelect={setSection}
      />

      <div className="min-w-0 space-y-4">

        {/* Active section panel */}
        {section === 'details' && <CourseDetails course={detail} onSaved={course.reload} />}
        {section === 'lessons' && <LessonManager course={documentId} onChanged={course.reload} />}
        {section === 'quiz' && <QuizPanel course={detail} onSaved={course.reload} />}

        {/* Next-step footer — guides the user through the builder like a wizard */}
        <div className="flex items-center justify-between rounded-xl border border-theme bg-surface px-5 py-3.5 shadow-xs">

          <p className="text-xs text-muted font-medium">
            {section === 'details' && 'Step 1 of 3 — Course Info'}
            {section === 'lessons' && 'Step 2 of 3 — Curriculum'}
            {section === 'quiz' && 'Step 3 of 3 — Quiz Assessment'}
          </p>

          <div className="flex items-center gap-2">
            {section !== 'details' && (
              <button
                type="button"
                onClick={() => setSection(section === 'quiz' ? 'lessons' : 'details')}
                className="flex items-center gap-1.5 rounded-lg border border-theme bg-canvas px-3.5 py-2 text-xs font-semibold text-secondary hover:text-primary hover:bg-elevated transition cursor-pointer"
              >
                ← Back
              </button>
            )}

            {section === 'details' && (
              <button
                type="button"
                onClick={() => setSection('lessons')}
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-sky-600/25 transition cursor-pointer"
              >
                Next: Curriculum →
              </button>
            )}

            {section === 'lessons' && (
              <button
                type="button"
                onClick={() => setSection('quiz')}
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-sky-600/25 transition cursor-pointer"
              >
                Next: Quiz Assessment →
              </button>
            )}

            {section === 'quiz' && (
              <a
                href={`/courses/${documentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/25 transition"
              >
                View Course ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EditCoursePage() {
  const params = useParams<{ documentId: string }>();

  return (
    <RequireAuth roles={['Instructor', 'Content Manager', 'Admin']}>
      <Suspense fallback={null}>
        <Builder documentId={params.documentId} />
      </Suspense>
    </RequireAuth>
  );
}
