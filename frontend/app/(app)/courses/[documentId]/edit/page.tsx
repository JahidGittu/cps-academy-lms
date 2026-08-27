'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { useApi } from '@/lib/use-api';
import type { Course, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Empty, LoadingState } from '@/components/ui';
import { BuilderHeader } from './builder-header';
import { BuilderNav, type Section } from './builder-nav';
import { CourseDetails } from './course-details';
import { LessonManager } from './lesson-manager';
import { QuizPanel } from './quiz-panel';

const Builder = ({ documentId }: { documentId: string }) => {
  const course = useApi<Single<Course>>(`/courses/${documentId}`);

  // Lessons rather than details: the title is typed once and the syllabus is what you come back for.
  const [section, setSection] = useState<Section>('lessons');

  if (course.loading) {
    return (
      <LoadingState
        message="Loading course editor..."
        subtext="Retrieving syllabus outline, lesson sequence, and quiz builder."
      />
    );
  }

  if (course.error) return <Alert>{course.error}</Alert>;

  const detail = course.data?.data;

  if (!detail) return <Empty>This course does not exist.</Empty>;

  // owned is the server's own answer to "may this account change the course", so the screen and the
  // policy behind the save agree. Hiding the form is politeness; the put would be refused anyway.
  if (!detail.owned) return <Empty>This course belongs to someone else.</Empty>;

  return (
    <div className="space-y-6">
      <BuilderHeader course={detail} />

      <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start">
        <BuilderNav
          section={section}
          lessons={detail.lessons?.length ?? 0}
          hasQuiz={Boolean(detail.quiz)}
          onSelect={setSection}
        />

        {section === 'details' && <CourseDetails course={detail} onSaved={course.reload} />}
        {section === 'lessons' && <LessonManager course={documentId} onChanged={course.reload} />}
        {section === 'quiz' && <QuizPanel course={detail} />}
      </div>
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
