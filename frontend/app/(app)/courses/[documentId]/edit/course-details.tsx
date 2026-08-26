'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { api, errorMessage } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Alert, Button, Card } from '@/components/ui';
import { CourseForm } from '@/components/course-form';

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
    <Card className="border-red-200">
      <h2 className="text-sm font-medium text-red-700">Delete this course</h2>

      <p className="mt-1 text-sm text-slate-600">
        The lessons, the quiz and every enrolment go with it, and none of it comes back.
      </p>

      <div className="mt-4 space-y-3">
        <Alert>{error}</Alert>

        <Button variant="danger" disabled={busy} onClick={() => void remove()}>
          {busy ? 'Deleting' : 'Delete course'}
        </Button>
      </div>
    </Card>
  );
};

export const CourseDetails = ({
  course,
  onSaved,
}: {
  course: Course;
  onSaved: () => Promise<void>;
}) => (
  <div className="space-y-6">
    <Card>
      <CourseForm
        course={course}
        label="Save changes"
        save={async (values) => {
          await api.put(`/courses/${course.documentId}`, { data: values });
          await onSaved();
        }}
      />
    </Card>

    <Delete course={course} />
  </div>
);
