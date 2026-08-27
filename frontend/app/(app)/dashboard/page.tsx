'use client';

import { hasRole, useAuth } from '@/lib/auth';
import { RequireAuth } from '@/components/require-auth';
import { EnrolledCourses } from './enrolled-courses';
import { ManagedCourses } from './managed-courses';

const Panel = () => {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  return (
    <div className="space-y-6">
      {isStudent ? <EnrolledCourses /> : <ManagedCourses />}
    </div>
  );
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Panel />
    </RequireAuth>
  );
}
