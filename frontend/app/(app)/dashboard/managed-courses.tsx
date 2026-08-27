'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Edit,
  Plus,
  Users,
  Eye,
  Trash2,
  Award,
  Sparkles,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Collection, Course } from '@/lib/types';
import { Alert, Empty, LoadingState } from '@/components/ui';
import { CourseCover } from '@/components/course-cover';

export const ManagedCourses = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const courses = useApi<Collection<Course>>('/courses?mine=true');

  const handleDelete = async (documentId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? All associated lessons and quizzes will be removed.`)) {
      return;
    }

    setDeletingId(documentId);
    setActionError('');

    try {
      await api.delete(`/courses/${documentId}`);
      await courses.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (courses.loading) {
    return (
      <LoadingState
        message="Loading course studio..."
        subtext="Fetching your authored curriculum, lessons, and student rosters."
      />
    );
  }

  if (courses.error) return <Alert>{courses.error}</Alert>;

  const rows = courses.data?.data ?? [];

  return (
    <section className="space-y-6">
      {/* Top Header & New Course Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Course Management Studio
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Author structured syllabus, manage sequential lessons, and monitor student completion rates.
          </p>
        </div>

        <Link
          href="/courses/new"
          className="brand-gradient inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:opacity-95 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>New Course</span>
        </Link>
      </div>

      <Alert>{actionError}</Alert>

      {/* Course Management Data Table */}
      {rows.length ? (
        <div className="overflow-hidden rounded-md border border-slate-200/90 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Course Title</th>
                  <th className="px-5 py-3.5">Lessons</th>
                  <th className="px-5 py-3.5">Quiz Assessment</th>
                  <th className="px-5 py-3.5">Instructor</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {rows.map((course) => {
                  const lessonCount = course.lessons?.length ?? 0;
                  const hasQuiz = Boolean(course.quiz);

                  return (
                    <tr key={course.documentId} className="hover:bg-slate-50/60 transition-colors">
                      {/* Course Cover & Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <div className="size-12 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 relative">
                            <CourseCover
                              title={course.title}
                              url={course.coverImageUrl}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-md">
                            <Link
                              href={`/courses/${course.documentId}`}
                              className="font-bold text-slate-900 hover:text-brand-600 transition block truncate"
                            >
                              {course.title}
                            </Link>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {course.description || 'Structured technical curriculum'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Lessons Count */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                          <BookOpen className="size-3.5 text-brand-600" />
                          <span>{lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}</span>
                        </span>
                      </td>

                      {/* Quiz Status */}
                      <td className="px-5 py-3.5">
                        {hasQuiz ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
                            <Award className="size-3.5 text-purple-600" />
                            <span>MCQ Quiz Added</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400">
                            <span>No Quiz</span>
                          </span>
                        )}
                      </td>

                      {/* Instructor */}
                      <td className="px-5 py-3.5 font-medium text-slate-600 text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 uppercase">
                            {(course.owner?.username || 'Staff').slice(0, 2)}
                          </span>
                          <span className="truncate">{course.owner?.username || 'Course Owner'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/courses/${course.documentId}`}
                            title="Preview Course"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          >
                            <Eye className="size-4" />
                          </Link>

                          <Link
                            href={`/courses/${course.documentId}/students`}
                            title="Student Progress Roster"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition"
                          >
                            <Users className="size-4" />
                          </Link>

                          <Link
                            href={`/courses/${course.documentId}/edit`}
                            title="Edit Curriculum"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition"
                          >
                            <Edit className="size-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(course.documentId, course.title)}
                            disabled={deletingId === course.documentId}
                            title="Delete Course"
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Empty>
          <p className="text-base font-bold text-slate-800">No courses in your studio yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Create your first course to begin adding sequential lessons and auto-graded quizzes.
          </p>
          <Link
            href="/courses/new"
            className="brand-gradient mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95"
          >
            <Plus className="size-4" />
            <span>Create Course Now</span>
          </Link>
        </Empty>
      )}
    </section>
  );
};
