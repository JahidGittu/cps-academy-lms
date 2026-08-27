'use client';

import { hasRole, useAuth } from '@/lib/auth';
import { RequireAuth } from '@/components/require-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { EnrolledCourses } from './enrolled-courses';
import { ManagedCourses } from './managed-courses';

const Panel = () => {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  return (
    <DashboardShell
      title={isStudent ? 'My Learning Dashboard' : 'Course Management Studio'}
      subtitle={
        isStudent
          ? 'Track your course progress, resume sequential lessons, and check graded quizzes.'
          : 'Create curriculum, manage lessons, and monitor student completion rates.'
      }
    >
      {isStudent ? <EnrolledCourses /> : <ManagedCourses />}
    </DashboardShell>
  );
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Panel />
    </RequireAuth>
  );
}
