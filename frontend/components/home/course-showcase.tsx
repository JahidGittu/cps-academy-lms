'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

import { useApi } from '@/lib/use-api';
import type { Collection, Course } from '@/lib/types';
import { Badge, Card, Empty } from '@/components/ui';

// Six fills two rows on a wide screen. Asked for as a page size rather than trimmed in the browser,
// so the front page does not get slower every time somebody adds a course.
const listQuery = '/courses?sort=createdAt:desc&pagination[pageSize]=6';

const CourseTile = ({ course }: { course: Course }) => {
  const lessons = course.lessons?.length ?? 0;

  return (
    <Link href={`/courses/${course.documentId}`} className="block">
      <Card hover className="flex h-full flex-col">
        <h3 className="font-medium">{course.title}</h3>

        {course.description && (
          <p className="mt-2 line-clamp-3 text-sm text-slate-600">{course.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-3.5" />
            {lessons} {lessons === 1 ? 'lesson' : 'lessons'}
          </span>

          {course.quiz && <Badge tone="brand">Ends with a quiz</Badge>}
        </div>

        {course.instructor && (
          <p className="mt-3 text-xs text-slate-400">Taught by {course.instructor}</p>
        )}
      </Card>
    </Link>
  );
};

export const CourseShowcase = () => {
  const courses = useApi<Collection<Course>>(listQuery);
  const rows = courses.data?.data ?? [];

  // The count comes off the pagination meta, so it is the whole catalogue rather than the six tiles
  // below it. Nothing on this page is a figure somebody typed in.
  const total = courses.data?.meta.pagination.total ?? 0;

  // A landing page has nothing useful to say about a 500, so it says the plain thing and gets out of
  // the way rather than putting a red error box in front of a visitor who has not asked for anything
  // yet.
  const body = () => {
    if (courses.loading) return <p className="text-sm text-slate-500">Loading courses</p>;

    if (courses.error) {
      return <p className="text-sm text-slate-500">The catalogue is not answering right now.</p>;
    }

    if (!rows.length) return <Empty>No courses on the platform yet.</Empty>;

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((course) => (
          <CourseTile key={course.documentId} course={course} />
        ))}
      </div>
    );
  };

  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Courses to start with</h2>

            <p className="mt-2 max-w-xl text-slate-600">
              {total
                ? `${total} ${total === 1 ? 'course' : 'courses'} on the platform. The syllabus is open to read; enrolling is what opens the lessons.`
                : 'The syllabus of every course is open to read. Enrolling is what opens the lessons.'}
            </p>
          </div>

          <Link
            href="/courses"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-600"
          >
            See all courses
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8">{body()}</div>
      </div>
    </section>
  );
};
