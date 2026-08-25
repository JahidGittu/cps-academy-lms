'use client';

import { hasRole, useAuth } from '@/lib/auth';
import { RequireAuth } from '@/components/require-auth';
import { EnrolledCourses } from './enrolled-courses';
import { ManagedCourses } from './managed-courses';

// The two halves of the site meet here. A student is asking how far through their courses they are;
// everyone else is asking what they are responsible for, so the panel is picked by role rather than
// showing both with one of them empty.
const Panel = () => {
  const { user } = useAuth();

  return hasRole(user, 'Student') ? <EnrolledCourses /> : <ManagedCourses />;
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      <RequireAuth>
        <Panel />
      </RequireAuth>
    </div>
  );
}
