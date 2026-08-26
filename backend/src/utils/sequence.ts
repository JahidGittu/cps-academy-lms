import type { Core } from '@strapi/strapi';

type Lesson = { documentId: string; title?: string | null; order?: number | null };

// A course is worked through in order: a lesson opens once every lesson above it in the syllabus has
// been marked done. Answers with the first one still outstanding rather than a yes or no, so whoever
// gets refused can be told which lesson to go back to.
//
// Two reads and a Set, rather than one filter for "lessons with no completion of mine". A negated
// filter across a relation is easy to write and hard to be sure of, and a syllabus is a handful of
// rows either way.
export const unfinishedLessonBefore = async (
  strapi: Core.Strapi,
  studentId: number,
  courseId: string,
  // Required in the schema, optional in Strapi's generated types. Nothing can be said to come
  // before a lesson with no position, so an unordered one is treated as the first.
  order?: number | null
): Promise<Lesson | null> => {
  if (typeof order !== 'number') return null;

  const earlier = (await strapi.documents('api::lesson.lesson').findMany({
    filters: { course: { documentId: courseId }, order: { $lt: order } },
    fields: ['title', 'order'],
    sort: 'order:asc',
  })) as Lesson[];

  if (!earlier.length) return null;

  const done = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
    filters: {
      student: { id: studentId },
      lesson: { documentId: { $in: earlier.map((lesson) => lesson.documentId) } },
    },
    populate: { lesson: { fields: ['title'] } },
  });

  const finished = new Set(done.map((row) => (row.lesson as Lesson | null)?.documentId));

  return earlier.find((lesson) => !finished.has(lesson.documentId)) ?? null;
};
