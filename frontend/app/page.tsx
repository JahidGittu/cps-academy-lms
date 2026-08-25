'use client';

import Link from 'next/link';
import { BookOpen, ClipboardCheck, LineChart } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui';

const features = [
  { icon: BookOpen, title: 'Courses and lessons', body: 'Work through a course one lesson at a time.' },
  { icon: ClipboardCheck, title: 'Graded quizzes', body: 'Answers are checked on the server, so the key never reaches the browser.' },
  { icon: LineChart, title: 'Progress you can see', body: 'Completion is counted from the lessons you finish.' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Learn something and prove it</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          A small learning platform: enrol in a course, read the lessons, take the quiz.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/courses"
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            Browse courses
          </Link>

          <Link
            href={user ? '/dashboard' : '/register'}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100"
          >
            {user ? 'Go to dashboard' : 'Create an account'}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <Icon className="size-5 text-slate-500" />
            <h2 className="mt-3 font-medium">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{body}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
