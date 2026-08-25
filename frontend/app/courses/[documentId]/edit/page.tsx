'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Course, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Empty } from '@/components/ui';
import { CourseForm } from '@/components/course-form';
import { LessonManager } from './lesson-manager';

const Delete = ({ course }: { course: Course }) => {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    if (!window.confirm(`Delete ${course.title}? Its lessons and quiz go with it.`)) return;

    setBusy(true);
    setError('');

    try {
      await api.delete(`/courses/${course.documentId}`);
      router.push('/dashboard');
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-slate-200 pt-6">
      <Alert>{error}</Alert>

      <Button variant="danger" disabled={busy} onClick={remove}>
        Delete course
      </Button>
    </div>
  );
};

const Edit = ({ documentId }: { documentId: string }) => {
  const course = useApi<Single<Course>>(`/courses/${documentId}`);

  if (course.loading) return <p className="text-sm text-slate-500">Loading course</p>;

  if (course.error) return <Alert>{course.error}</Alert>;

  const detail = course.data?.data;

  if (!detail) return <Empty>This course does not exist.</Empty>;

  // owned is the server's own answer to "may this account change the course", so the screen and the
  // policy behind the save agree. Hiding the form is politeness; the put would be refused anyway.
  if (!detail.owned) return <Empty>This course belongs to someone else.</Empty>;

  return (
    <div className="space-y-6">
      <Link
        href={`/courses/${documentId}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        {detail.title}
      </Link>

      <CourseForm
        course={detail}
        label="Save changes"
        save={async (values) => {
          await api.put(`/courses/${documentId}`, { data: values });
          await course.reload();
        }}
      />

      <LessonManager course={documentId} />

      <Delete course={detail} />
    </div>
  );
};

export default function EditCoursePage() {
  const params = useParams<{ documentId: string }>();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit course</h1>

      <RequireAuth roles={['Instructor', 'Content Manager', 'Admin']}>
        <Edit documentId={params.documentId} />
      </RequireAuth>
    </div>
  );
}
