'use client';

import Link from 'next/link';
import { BookOpen, Edit, Plus, Users } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Collection, Course } from '@/lib/types';
import { Alert, Card, Empty } from '@/components/ui';
import { CourseCover } from '@/components/course-cover';

export const ManagedCourses = () => {
  const courses = useApi<Collection<Course>>('/courses?mine=true');

  if (courses.loading) return <p className="text-sm text-slate-500">Loading managed courses...</p>;

  if (courses.error) return <Alert>{courses.error}</Alert>;

  const rows = courses.data?.data ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Courses</h2>
          <p className="text-xs sm:text-sm text-slate-500">Create, edit, and monitor student progress across your curriculum.</p>
        </div>

        <Link 
          href="/courses/new" 
          className="brand-gradient inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:opacity-95 hover:shadow-sm"
        >
          <Plus className="size-4" />
          <span>New Course</span>
        </Link>
      </div>

      {rows.length ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {rows.map((course) => (
            <Card key={course.documentId} hover className="flex flex-col sm:flex-row gap-4 p-0 overflow-hidden rounded-md border-slate-200/90">
              <div className="w-full sm:w-36 h-28 sm:h-auto shrink-0 relative overflow-hidden">
                <CourseCover title={course.title} url={course.coverImageUrl} className="h-full w-full object-cover" />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <Link 
                    href={`/courses/${course.documentId}`} 
                    className="font-bold text-slate-900 hover:text-brand-600 transition-colors text-base line-clamp-1"
                  >
                    {course.title}
                  </Link>

                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <BookOpen className="size-3.5 text-brand-600" />
                    <span>{course.lessons?.length ?? 0} {course.lessons?.length === 1 ? 'lesson' : 'lessons'}</span>
                    {course.quiz && <span className="text-purple-600 font-semibold">· MCQ Quiz</span>}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Link
                    href={`/courses/${course.documentId}/students`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Users className="size-3.5 text-slate-500" />
                    <span>Students</span>
                  </Link>

                  <Link
                    href={`/courses/${course.documentId}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 border border-brand-200/80 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                  >
                    <Edit className="size-3.5" />
                    <span>Edit</span>
                  </Link>
                </div>
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
