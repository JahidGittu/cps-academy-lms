'use client';

import { api } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Card } from '@/components/ui';
import { CourseForm } from '@/components/course-form';

export const CourseDetails = ({
  course,
  onSaved,
  onNext,
}: {
  course: Course;
  onSaved: () => Promise<void>;
  onNext?: () => void;
}) => (
  <div className="space-y-6">
    <Card>
      <CourseForm
        course={course}
        label="Save changes"
        onNext={onNext}
        save={async (values) => {
          await api.put(`/courses/${course.documentId}`, { data: values });
          await onSaved();
        }}
      />
    </Card>
  </div>
);
