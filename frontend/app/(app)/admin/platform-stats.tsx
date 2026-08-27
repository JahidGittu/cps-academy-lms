'use client';

import { BookOpen, ClipboardList, FileText, Sparkles, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Single, Stats } from '@/lib/types';
import { Alert, Card, LoadingState } from '@/components/ui';

const Tile = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}) => (
  <Card hover className="flex items-center gap-4 p-5">
    <span className={`flex size-11 items-center justify-center rounded-lg ${color} shadow-xs`}>
      <Icon className="size-5" />
    </span>

    <div>
      <span className="block text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  </Card>
);

export const PlatformStats = () => {
  const stats = useApi<Single<Stats>>('/stats');

  if (stats.loading) {
    return (
      <LoadingState
        message="Loading platform analytics..."
        subtext="Aggregating user registrations, active enrollments, and quiz metrics."
        minHeight="min-h-[220px]"
      />
    );
  }

  if (stats.error) return <Alert>{stats.error}</Alert>;

  const data = stats.data?.data;

  if (!data) return null;

  const users = data.users.reduce((total, row) => total + row.count, 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Platform Overview</h2>
          <p className="text-xs sm:text-sm text-slate-500">Real-time counts across users, curriculum, enrollments, and content.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile icon={Users} label="Total Accounts" value={users} color="bg-indigo-50 text-indigo-600 border border-indigo-100" />
        <Tile icon={BookOpen} label="Total Courses" value={data.courses} color="bg-violet-50 text-violet-600 border border-violet-100" />
        <Tile icon={FileText} label="Total Lessons" value={data.lessons} color="bg-sky-50 text-sky-600 border border-sky-100" />
        <Tile icon={Sparkles} label="Active Enrollments" value={data.enrollments} color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
        <Tile icon={ClipboardList} label="Quiz Submissions" value={data.quizAttempts} color="bg-amber-50 text-amber-600 border border-amber-100" />
      </div>
    </section>
  );
};
