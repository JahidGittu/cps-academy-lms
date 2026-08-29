'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Collection, Course } from '@/lib/types';
import { Empty } from '@/components/ui';
import { CourseTile } from '@/components/course-tile';

const listQuery = '/courses?sort=createdAt:desc&pagination[pageSize]=6';

export const CourseShowcase = () => {
  const courses = useApi<Collection<Course>>(listQuery);
  const rows = courses.data?.data ?? [];

  const total = courses.data?.meta?.pagination?.total ?? rows.length;

  const body = () => {
    if (courses.loading) return <p className="text-sm text-muted">Loading courses...</p>;

    if (courses.error) {
      return <p className="text-sm text-muted">The catalogue is not answering right now.</p>;
    }

    if (!rows.length) return <Empty>No courses on the platform yet.</Empty>;

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((course) => (
          <CourseTile key={course.documentId} course={course} />
        ))}
      </div>
    );
  };

  return (
    <section className="border-b border-theme bg-subtle py-16 transition-colors duration-200">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              Explore Our Courses
            </h2>
            <p className="mt-2 text-base text-secondary">
              Structured engineering courses with sequential lessons and auto-graded assessments.
            </p>
          </div>

          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 rounded-lg border border-theme bg-surface px-5 py-2.5 text-sm font-semibold text-primary shadow-2xs hover:bg-elevated hover:text-brand transition"
          >
            <span>View All ({total})</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {body()}
      </div>
    </section>
  );
};
