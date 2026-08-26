'use client';

import { BookOpen, ClipboardList, FileText, Newspaper, PencilLine, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Single, Stats } from '@/lib/types';
import { Alert, Card } from '@/components/ui';

const Tile = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) => (
  <Card className="flex items-center gap-3">
    <span className="rounded bg-slate-100 p-2 text-slate-600">
      <Icon className="size-4" />
    </span>

    <span>
      <span className="block text-xl font-semibold">{value}</span>
      <span className="block text-xs text-slate-500">{label}</span>
    </span>
  </Card>
);

// Counted by the server rather than by fetching every collection and reading the lengths here, so
// the numbers do not depend on how many rows a page happens to have asked for.
export const PlatformStats = () => {
  const stats = useApi<Single<Stats>>('/stats');

  if (stats.loading) return <p className="text-sm text-slate-500">Loading stats</p>;

  if (stats.error) return <Alert>{stats.error}</Alert>;

  const data = stats.data?.data;

  if (!data) return null;

  const users = data.users.reduce((total, row) => total + row.count, 0);

  return (
    <section>
      <h2 className="mb-3 text-lg font-medium">Platform</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <Tile icon={Users} label="accounts" value={users} />
        <Tile icon={BookOpen} label="courses" value={data.courses} />
        <Tile icon={FileText} label="lessons" value={data.lessons} />
        <Tile icon={PencilLine} label="enrollments" value={data.enrollments} />
        <Tile icon={ClipboardList} label="quiz attempts" value={data.quizAttempts} />
        <Tile icon={Newspaper} label="published posts" value={data.blogPosts.published} />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {data.users.map((row) => `${row.count} ${row.role}`).join(' · ')} ·{' '}
        {data.blogPosts.drafts} in draft
      </p>
    </section>
  );
};
