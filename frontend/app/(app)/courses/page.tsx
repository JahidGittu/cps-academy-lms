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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-subtle">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight sm:text-4xl">Course Catalogue</h1>
          <p className="mt-2 text-base text-secondary">
            Browse available courses. Inspect syllabi, lessons, and quizzes before enrolling.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-theme bg-surface pl-10 pr-4 py-2 text-sm text-primary placeholder:text-muted outline-none transition focus:border-active focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted flex items-center gap-1">
            <Filter className="size-3.5" /> Filter:
          </span>
          {FILTERS.map((tab) => {
            if (tab === 'Enrolled Only' && !isStudent) return null;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-surface text-secondary border border-theme hover:bg-elevated hover:text-primary'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-muted">
          Showing <strong className="text-primary">{filtered.length}</strong> of {rows.length} {rows.length === 1 ? 'course' : 'courses'}
        </span>
      </div>

      {/* Course Grid */}
      {courses.loading ? (
        <LoadingState />
      ) : courses.error ? (
        <Alert>{courses.error}</Alert>
      ) : filtered.length === 0 ? (
        <Empty>
          <p className="font-semibold text-primary">No courses match your search</p>
          <p className="text-xs text-muted mt-1">Try clearing your filters or search query.</p>
          {(query || filter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('All');
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline cursor-pointer"
            >
              Clear All Filters ✕
            </button>
          )}
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
