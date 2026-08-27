'use client';

import { RequireAuth } from '@/components/require-auth';
import { ManagedCourses } from '@/app/(app)/dashboard/managed-courses';

export default function CourseManagementPage() {
  return (
    <RequireAuth roles={['Admin', 'Content Manager', 'Instructor']}>
      <ManagedCourses />
    </RequireAuth>
  );
}
