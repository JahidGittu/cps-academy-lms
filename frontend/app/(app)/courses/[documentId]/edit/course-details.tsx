'use client';

import { api } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Card } from '@/components/ui';
import { CourseForm } from '@/components/course-form';

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
  </div>
);
