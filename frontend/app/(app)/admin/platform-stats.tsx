'use client';

import { BookOpen, ClipboardList, FileText, GraduationCap, Newspaper, Sparkles, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Single, Stats } from '@/lib/types';
import { Alert, Card, LoadingState } from '@/components/ui';

const Tile = ({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  subtitle?: string;
  color: string;
}) => (
  <Card hover className="flex items-center gap-4 p-5">
    <span className={`flex size-12 shrink-0 items-center justify-center rounded-md ${color} shadow-xs`}>
      <Icon className="size-6" />
    </span>

    <div className="min-w-0">
      <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
      <span className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</span>
      {subtitle && <span className="block text-[11px] font-medium text-slate-400 mt-0.5">{subtitle}</span>}
    </div>
  </Card>
);

export const PlatformStats = () => {
  const stats = useApi<Single<Stats>>('/stats');

  if (stats.loading) {
    return <LoadingState />;
  }

  if (stats.error) return <Alert>{stats.error}</Alert>;

  const data = stats.data?.data;

  if (!data) return null;

  const totalStudents = data.users.find((row) => row.role === 'Student')?.count ?? 0;
  const totalArticles = (data.blogPosts?.published ?? 0) + (data.blogPosts?.drafts ?? 0);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Overview</h2>
        <p className="text-xs sm:text-sm text-slate-500">Real-time metrics across registered students, curriculum, enrollments, and content.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile
          icon={GraduationCap}
          label="Total Students"
          value={totalStudents}
          subtitle="Registered student learners"
          color="bg-indigo-50 text-indigo-600 border border-indigo-100"
        />
        <Tile
          icon={BookOpen}
          label="Active Courses"
          value={data.courses}
          subtitle="Curriculums published"
          color="bg-violet-50 text-violet-600 border border-violet-100"
        />
        <Tile
          icon={FileText}
          label="Total Lessons"
          value={data.lessons}
          subtitle="Interactive sequential modules"
          color="bg-sky-50 text-sky-600 border border-sky-100"
        />
        <Tile
          icon={Sparkles}
          label="Active Enrollments"
          value={data.enrollments}
          subtitle="Student registrations"
          color="bg-emerald-50 text-emerald-600 border border-emerald-100"
        />
        <Tile
          icon={ClipboardList}
          label="Quiz Assessments"
          value={data.quizAttempts}
          subtitle="Total quiz attempts evaluated"
          color="bg-amber-50 text-amber-600 border border-amber-100"
        />
        <Tile
          icon={Newspaper}
          label="Blog Articles"
          value={totalArticles}
          subtitle={`${data.blogPosts?.published ?? 0} published, ${data.blogPosts?.drafts ?? 0} drafts`}
          color="bg-rose-50 text-rose-600 border border-rose-100"
        />
      </div>
    </section>
  );
};
