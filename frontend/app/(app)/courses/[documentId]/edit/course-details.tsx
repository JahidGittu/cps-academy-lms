'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { api, errorMessage } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Alert, Button, Card } from '@/components/ui';
import { CourseForm } from '@/components/course-form';
import { ConfirmModal } from '@/components/confirm-modal';

const Delete = ({ course }: { course: Course }) => {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirmRemove = async () => {
    setBusy(true);
    setError('');

    try {
      await api.delete(`/courses/${course.documentId}`);
      router.push('/dashboard');
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50/20">
        <h2 className="text-sm font-bold text-red-700">Delete this course</h2>

        <p className="mt-1 text-xs text-slate-600">
          The lessons, the quiz and every student enrolment go with it, and none of it can be recovered.
        </p>

        <div className="mt-4 space-y-3">
          <Alert>{error}</Alert>

          <Button variant="danger" disabled={busy} onClick={() => setShowModal(true)}>
            Delete course
          </Button>
        </div>
      </Card>

      {/* SweetAlert Course Deletion Modal */}
      <ConfirmModal
        isOpen={showModal}
        title="Delete This Course?"
        message={`Are you sure you want to delete "${course.title}"? This will permanently erase all associated syllabus lessons, student records, and quizzes.`}
        confirmText="Yes, Delete Course"
        cancelText="Cancel"
        loading={busy}
        onConfirm={confirmRemove}
        onClose={() => setShowModal(false)}
      />
    </>
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
