'use client';

import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import type { Course, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { CourseForm } from '@/components/course-form';

const Create = () => {
  const router = useRouter();

  return (
    <CourseForm
      label="Create course"
      save={async (values) => {
        // The owner is not in the body. The course controller takes it from the session, so an
        // instructor cannot post a course into somebody else's name.
        const { data } = await api.post<Single<Course>>('/courses', { data: values });

        router.push(`/courses/${data.data.documentId}/edit`);
      }}
    />
  );
};

export default function NewCoursePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New course</h1>

      <RequireAuth roles={['Instructor', 'Content Manager', 'Admin']}>
        <Create />
      </RequireAuth>
    </div>
  );
}
