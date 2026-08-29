'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Edit,
  Plus,
  Users,
  Eye,
  Trash2,
  Award,
  Search,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment } from '@/lib/types';
import { Alert, Button, Empty } from '@/components/ui';
import { ManagedCoursesSkeleton } from '@/components/page-skeletons';
import { CourseCover } from '@/components/course-cover';
import { ConfirmModal } from '@/components/confirm-modal';

type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'lessons_desc' | 'lessons_asc';
type QuizFilter = 'all' | 'with_quiz' | 'no_quiz';

export const ManagedCourses = () => {
  const [query, setQuery] = useState('');
  const [quizFilter, setQuizFilter] = useState<QuizFilter>('all');
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [deletingCourse, setDeletingCourse] = useState<{ id: string; title: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const courses = useApi<Collection<Course>>('/courses?mine=true');
  const enrollments = useApi<Collection<Enrollment>>('/enrollments?populate=course,student');

  const confirmDelete = async () => {
    if (!deletingCourse) return;

    setBusy(true);
    setActionError('');

    try {
      await api.delete(`/courses/${deletingCourse.id}`);
      setDeletingCourse(null);
      await courses.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const rows = courses.data?.data ?? [];

  // Calculate distinct active students registered in these managed courses
  const activeCourseIds = useMemo(() => new Set(rows.map((c) => c.documentId)), [rows]);
  const totalEnrolledStudents = useMemo(() => {
    const list = enrollments.data?.data ?? [];
    const studentIds = new Set<number | string>();
    for (const e of list) {
      if (e.course?.documentId && activeCourseIds.has(e.course.documentId) && e.student?.id) {
        studentIds.add(e.student.id);
      }
    }
    return studentIds.size;
  }, [enrollments.data, activeCourseIds]);

  const instructors = useMemo(() => {
    const set = new Set<string>();
    for (const c of rows) {
      if (c.instructor) set.add(c.instructor);
    }
    return Array.from(set);
  }, [rows]);

  const filteredCourses = useMemo(() => {
    return rows
      .filter((course) => {
        const matchesQuery =
          query.trim() === '' ||
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          (course.description ?? '').toLowerCase().includes(query.toLowerCase()) ||
          (course.instructor ?? '').toLowerCase().includes(query.toLowerCase());

        const matchesQuiz =
          quizFilter === 'all' ||
          (quizFilter === 'with_quiz' && Boolean(course.quiz)) ||
          (quizFilter === 'no_quiz' && !course.quiz);

        const matchesInstructor =
          instructorFilter === 'all' || course.instructor === instructorFilter;

        return matchesQuery && matchesQuiz && matchesInstructor;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
        }
        if (sortBy === 'title_asc') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'title_desc') {
          return b.title.localeCompare(a.title);
        }
        if (sortBy === 'lessons_desc') {
          return (b.lessons?.length ?? 0) - (a.lessons?.length ?? 0);
        }
        if (sortBy === 'lessons_asc') {
          return (a.lessons?.length ?? 0) - (b.lessons?.length ?? 0);
        }
        return 0;
      });
  }, [rows, query, quizFilter, instructorFilter, sortBy]);

  const hasActiveFilters =
    query !== '' || quizFilter !== 'all' || instructorFilter !== 'all' || sortBy !== 'newest';

  const resetFilters = () => {
    setQuery('');
    setQuizFilter('all');
    setInstructorFilter('all');
    setSortBy('newest');
  };

  if (courses.loading) {
    return <ManagedCoursesSkeleton />;
  }

  if (courses.error) return <Alert>{courses.error}</Alert>;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
            Courses
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Author structured syllabus, manage sequential lessons, and monitor student completion rates.
          </p>
        </div>

        <Link
          href="/courses/new"
          className="brand-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:opacity-95 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>New Course</span>
        </Link>
      </div>

      <Alert>{actionError}</Alert>

      {/* Real High-Value LMS KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-theme bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Active Courses</p>
            <div className="size-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand">
              <BookOpen className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-primary">{rows.length}</p>
          <p className="mt-1 text-[11px] font-medium text-muted">Published in course library</p>
        </div>

        <div className="rounded-xl border border-theme bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Enrolled Students</p>
            <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Users className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-500">{totalEnrolledStudents}</p>
          <p className="mt-1 text-[11px] font-medium text-muted">Learners registered across courses</p>
        </div>

        <div className="rounded-xl border border-theme bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Active Instructors</p>
            <div className="size-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <GraduationCap className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-purple-400">{instructors.length || 1}</p>
          <p className="mt-1 text-[11px] font-medium text-muted">Content creators & faculty</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-theme shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            placeholder="Search by title, description, instructor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg border border-theme bg-canvas text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-active transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={quizFilter}
            onChange={(e) => setQuizFilter(e.target.value as QuizFilter)}
            className="rounded-lg border border-theme bg-surface px-2.5 py-1.5 text-xs font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-active"
          >
            <option value="all">All Quizzes</option>
            <option value="with_quiz">With Quiz</option>
            <option value="no_quiz">Without Quiz</option>
          </select>

          {instructors.length > 1 && (
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="rounded-lg border border-theme bg-surface px-2.5 py-1.5 text-xs font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-active"
            >
              <option value="all">All Instructors</option>
              {instructors.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-theme bg-surface px-2.5 py-1.5 text-xs font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-active"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
              <option value="lessons_desc">Most Lessons</option>
              <option value="lessons_asc">Least Lessons</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-theme bg-elevated px-2.5 py-1.5 text-xs font-bold text-secondary hover:text-primary transition"
              title="Reset all filters"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted font-medium px-1">
        <span>
          Showing <strong>{filteredCourses.length}</strong> of {rows.length} courses
        </span>
      </div>

      {filteredCourses.length ? (
        <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-subtle bg-canvas text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3.5">Course Title</th>
                  <th className="px-5 py-3.5">Lessons</th>
                  <th className="px-5 py-3.5">Quiz Assessment</th>
                  <th className="px-5 py-3.5">Instructor</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-subtle">
                {filteredCourses.map((course) => {
                  const lessonCount = course.lessons?.length ?? 0;
                  const hasQuiz = Boolean(course.quiz);

                  return (
                    <tr key={course.documentId} className="hover:bg-elevated/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <div className="size-12 rounded-lg overflow-hidden bg-canvas shrink-0 border border-theme relative shadow-2xs">
                            <CourseCover
                              title={course.title}
                              url={course.coverImageUrl}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-md">
                            <Link
                              href={`/courses/${course.documentId}`}
                              className="font-bold text-primary hover:text-brand transition block truncate"
                            >
                              {course.title}
                            </Link>
                            <p className="text-xs text-muted truncate mt-0.5">
                              {course.description || 'Structured technical curriculum'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 font-bold text-primary">
                          <BookOpen className="size-3.5 text-brand" />
                          <span>
                            {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                          </span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {hasQuiz ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-400 border border-purple-500/20">
                            <Award className="size-3.5" />
                            <span>MCQ Quiz Added</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-canvas px-2.5 py-1 text-xs font-medium text-muted border border-theme">
                            <span>No Quiz</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-canvas text-[10px] font-bold text-primary uppercase border border-theme">
                            {(course.instructor ?? 'CPS').slice(0, 2)}
                          </span>
                          <span className="font-semibold text-secondary text-xs">
                            {course.instructor ?? 'Platform Admin'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/courses/${course.documentId}`}
                            title="Preview Public Course"
                            className="rounded-lg p-1.5 text-muted hover:bg-elevated hover:text-primary transition"
                          >
                            <Eye className="size-4" />
                          </Link>

                          <Link
                            href={`/courses/${course.documentId}/students`}
                            title="Student Progress Roster"
                            className="rounded-lg p-1.5 text-muted hover:bg-elevated hover:text-brand transition"
                          >
                            <Users className="size-4" />
                          </Link>

                          <Link
                            href={`/courses/${course.documentId}/edit`}
                            title="Edit Curriculum Syllabus"
                            className="rounded-lg p-1.5 text-muted hover:bg-elevated hover:text-brand transition"
                          >
                            <Edit className="size-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              setDeletingCourse({
                                id: course.documentId,
                                title: course.title,
                              })
                            }
                            disabled={busy && deletingCourse?.id === course.documentId}
                            title="Delete Course"
                            className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
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
          <p className="text-base font-bold text-primary">
            {hasActiveFilters ? 'No courses match your filter criteria' : 'No courses created yet'}
          </p>
          <p className="text-xs text-muted mt-1">
            {hasActiveFilters
              ? 'Try resetting the search keyword or adjusting quiz and instructor filters.'
              : 'Create your first course, add structured lessons, and publish to the academy.'}
          </p>
          {hasActiveFilters ? (
            <Button variant="plain" onClick={resetFilters} className="mt-4">
              Reset Filters
            </Button>
          ) : (
            <Link
              href="/courses/new"
              className="brand-gradient mt-4 inline-flex items-center gap-2 rounded px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95"
            >
              <Plus className="size-4" />
              <span>Create First Course</span>
            </Link>
          )}
        </Empty>
      )}

      {/* SweetAlert Course Deletion Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingCourse)}
        title="Delete This Course?"
        message={`Are you sure you want to delete "${deletingCourse?.title}"? All lessons, quizzes, and student enrollments attached to this course will be permanently removed.`}
        confirmText="Yes, Delete Course"
        cancelText="Cancel"
        loading={busy}
        onConfirm={confirmDelete}
        onClose={() => setDeletingCourse(null)}
      />
    </section>
  );
};
