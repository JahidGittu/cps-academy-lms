'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';

import { hasRole, useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment } from '@/lib/types';
import { Alert, Empty, LoadingState } from '@/components/ui';
import { CourseTile } from '@/components/course-tile';

const FILTERS = ['All', 'With Quizzes', 'Enrolled Only'];

export default function CoursesPage() {
  const { user } = useAuth();
  const isStudent = hasRole(user, 'Student');

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const courses = useApi<Collection<Course>>('/courses');
  const enrollments = useApi<Collection<Enrollment>>(
    isStudent ? '/enrollments?populate=course' : null
  );

  const enrolledIn = useMemo(
    () => new Set((enrollments.data?.data ?? []).map((row) => row.course?.documentId)),
    [enrollments.data]
  );

  const rows = courses.data?.data ?? [];

  // Client-side search and category filtering
  const filtered = useMemo(() => {
    return rows.filter((course) => {
      const matchesQuery =
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        (course.description ?? '').toLowerCase().includes(query.toLowerCase());

      if (!matchesQuery) return false;

      if (filter === 'With Quizzes') return Boolean(course.quiz);
      if (filter === 'Enrolled Only') return enrolledIn.has(course.documentId);

      return true;
    });
  }, [rows, query, filter, enrolledIn]);

  return (
    <div className="space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">Course Catalogue</h1>
          <p className="mt-2 text-base text-slate-600">
            Browse available courses. Inspect syllabi, lessons, and quizzes before enrolling.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="size-3.5" /> Filter:
          </span>
          {FILTERS.map((tab) => {
            if (tab === 'Enrolled Only' && !isStudent) return null;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  filter === tab
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-slate-500">
          Showing <strong className="text-slate-800">{filtered.length}</strong> of {rows.length} {rows.length === 1 ? 'course' : 'courses'}
        </span>
      </div>

      {/* Course Grid */}
      {courses.loading ? (
        <LoadingState
          message="Loading course catalogue..."
          subtext="Fetching available tracks, syllabi, and interactive quizzes."
        />
      ) : courses.error ? (
        <Alert>{courses.error}</Alert>
      ) : filtered.length === 0 ? (
        <Empty>
          <p className="font-semibold text-slate-700">No courses match your search</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search query.</p>
        </Empty>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseTile
              key={course.documentId}
              course={course}
              enrolled={enrolledIn.has(course.documentId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
