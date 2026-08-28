'use client';

import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import type { Course, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { CourseForm } from '@/components/course-form';
import { Card } from '@/components/ui';
import { useSetBreadcrumbs } from '@/components/dashboard-shell';
import { BuilderNav } from '@/app/(app)/courses/[documentId]/edit/builder-nav';

const Create = () => {
  const router = useRouter();

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start">
      <BuilderNav
        section="details"
        lessons={0}
        hasQuiz={false}
        isNewCourse={true}
        onSelect={() => {}}
      />

      <Card>
        <CourseForm
          label="Create course"
          save={async (values) => {
            // The owner is not in the body. The course controller takes it from the session, so an
            // instructor cannot post a course into somebody else's name.
            const { data } = await api.post<Single<Course>>('/courses', { data: values });

            router.push(`/courses/${data.data.documentId}/edit`);
          }}
        />
      </Card>
    </div>
  );
};

export default function NewCoursePage() {
  useSetBreadcrumbs([
    { label: 'Courses', href: '/admin/course-management' },
    { label: 'New Course' },
  ]);

  return (
    <div className="space-y-6">
      <RequireAuth roles={['Instructor', 'Content Manager', 'Admin']}>
        <Create />
      </RequireAuth>
    </div>
  );
}
