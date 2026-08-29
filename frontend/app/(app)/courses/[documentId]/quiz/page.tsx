'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Course, QuizKey, Single } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Empty, LoadingState } from '@/components/ui';
import { ConfirmModal } from '@/components/confirm-modal';
import { useSetBreadcrumbs } from '@/components/dashboard-shell';
import { QuizBuilder } from './builder';
import { blankQuestion } from './question-fields';

const DeleteQuiz = ({ quiz, course }: { quiz: string; course: string }) => {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirmRemove = async () => {
    setBusy(true);
    setError('');

    try {
      await api.delete(`/quizzes/${quiz}`);
      router.push(`/courses/${course}/edit`);
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
      setShowModal(false);
    }
  };

  return (
    <div className="border-t border-subtle pt-6">
      <Alert>{error}</Alert>

      <Button variant="danger" disabled={busy} onClick={() => setShowModal(true)}>
        Delete quiz
      </Button>

      {/* SweetAlert Quiz Deletion Modal */}
      <ConfirmModal
        isOpen={showModal}
        title="Delete This Quiz Assessment?"
        message="Are you sure you want to permanently delete this quiz? All student attempts, auto-graded records, and question data will be lost."
        confirmText="Yes, Delete Quiz"
        cancelText="Cancel"
        loading={busy}
        onConfirm={confirmRemove}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

const Screen = ({ documentId }: { documentId: string }) => {
  const course = useApi<Single<Course>>(`/courses/${documentId}`);

  const detail = course.data?.data;
  const quiz = detail?.quiz?.documentId;

  const key = useApi<Single<QuizKey>>(quiz ? `/quizzes/${quiz}/answers` : null);

  useSetBreadcrumbs(
    detail
      ? [
          { label: 'Courses', href: '/admin/course-management' },
          { label: detail.title, href: `/courses/${documentId}/edit` },
          { label: 'Quiz Assessment' },
        ]
      : [{ label: 'Courses', href: '/admin/course-management' }, { label: 'Quiz Assessment' }]
  );

  if ((course.loading && !course.data) || (key.loading && !key.data)) {
    return <LoadingState />;
  }

  if (course.error) return <Alert>{course.error}</Alert>;

  if (!detail) return <Empty>This course does not exist.</Empty>;

  if (!detail.owned) return <Empty>This course belongs to someone else.</Empty>;

  const answers = key.data?.data;

  return (
    <div className="space-y-6">
      <QuizBuilder
        course={documentId}
        quiz={quiz}
        title={answers?.title ?? `${detail.title} check`}
        questions={answers?.questions ?? [blankQuestion()]}
        onSaved={async () => {
          await course.reload();
          await key.reload();
        }}
      />

      {quiz && <DeleteQuiz quiz={quiz} course={documentId} />}
    </div>
  );
};

export default function CourseQuizPage() {
  const params = useParams<{ documentId: string }>();

  return (
    <RequireAuth roles={['Instructor', 'Content Manager', 'Admin']}>
      <Screen documentId={params.documentId} />
    </RequireAuth>
  );
}
