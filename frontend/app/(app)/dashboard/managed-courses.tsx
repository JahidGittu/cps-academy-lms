'use client';

import Link from 'next/link';
import { BookOpen, Edit, Plus, Users } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Collection, Course } from '@/lib/types';
import { Alert, Card, Empty } from '@/components/ui';

export const ManagedCourses = () => {
  const courses = useApi<Collection<Course>>('/courses?mine=true');

  if (courses.loading) return <p className="text-sm text-slate-500">Loading managed courses...</p>;

  if (courses.error) return <Alert>{courses.error}</Alert>;

  const rows = courses.data?.data ?? [];

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Courses</h2>
          <p className="text-xs sm:text-sm text-slate-500">Create, edit, and monitor student progress across your curriculum.</p>
        </div>

        <Link 
          href="/courses/new" 
          className="brand-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:opacity-95 hover:shadow-md"
        >
          <Plus className="size-4" />
          <span>New Course</span>
        </Link>
      </div>

      {rows.length ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {rows.map((course) => (
            <Card key={course.documentId} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <Link 
                    href={`/courses/${course.documentId}`} 
                    className="font-semibold text-slate-900 hover:text-brand-600 transition-colors text-base"
                  >
                    {course.title}
                  </Link>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <BookOpen className="size-3.5 text-brand-600" />
                  <span>{course.lessons?.length ?? 0} {course.lessons?.length === 1 ? 'lesson' : 'lessons'}</span>
                  {course.quiz && <span className="text-purple-600 font-semibold">· MCQ Quiz active</span>}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Link
                  href={`/courses/${course.documentId}/students`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <Users className="size-3.5 text-slate-500" />
                  <span>Student Progress</span>
                </Link>

                <Link
                  href={`/courses/${course.documentId}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 border border-brand-200/80 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                >
                  <Edit className="size-3.5" />
                  <span>Edit Curriculum</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          <p className="text-base font-medium text-slate-700">No courses managed yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first course to begin adding lessons and quizzes.</p>
        </Empty>
      )}
    </section>
  );
};
