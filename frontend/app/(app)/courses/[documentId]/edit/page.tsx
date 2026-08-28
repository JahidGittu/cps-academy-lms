'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { useApi } from '@/lib/use-api';
import type { Course, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Empty, LoadingState } from '@/components/ui';
import { useSetBreadcrumbs } from '@/components/dashboard-shell';
import { BuilderNav, type Section } from './builder-nav';
import { CourseDetails } from './course-details';
import { LessonManager } from './lesson-manager';
import { QuizPanel } from './quiz-panel';

const Builder = ({ documentId }: { documentId: string }) => {
  const course = useApi<Single<Course>>(`/courses/${documentId}`);

  // Default to 1st tab (Details & Overview) when opening course edit
  const [section, setSection] = useState<Section>('details');

  const detail = course.data?.data;

  useSetBreadcrumbs(
    detail
      ? [
          { label: 'Courses', href: '/admin/course-management' },
          { label: detail.title },
        ]
      : [{ label: 'Courses', href: '/admin/course-management' }, { label: 'Edit Course' }]
  );

  if (course.loading && !course.data) {
    return <LoadingState />;
  }

  if (course.error) return <Alert>{course.error}</Alert>;

  if (!detail) return <Empty>This course does not exist.</Empty>;

  // owned is the server's own answer to "may this account change the course", so the screen and the
  // policy behind the save agree. Hiding the form is politeness; the put would be refused anyway.
  if (!detail.owned) return <Empty>This course belongs to someone else.</Empty>;

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start">
      <BuilderNav
        section={section}
        lessons={detail.lessons?.length ?? 0}
        hasQuiz={Boolean(detail.quiz)}
        courseId={documentId}
        onSelect={setSection}
      />

      {section === 'details' && <CourseDetails course={detail} onSaved={course.reload} />}
      {section === 'lessons' && <LessonManager course={documentId} onChanged={course.reload} />}
      {section === 'quiz' && <QuizPanel course={detail} />}
    </div>
  );
};

export default function EditCoursePage() {
  const params = useParams<{ documentId: string }>();

  return (
    <RequireAuth roles={['Instructor', 'Content Manager', 'Admin']}>
      <Builder documentId={params.documentId} />
    </RequireAuth>
  );
}
