import type { Core } from '@strapi/strapi';

type Lesson = { documentId: string; title?: string | null; order?: number | null };

export const unfinishedLessonBefore = async (
  strapi: Core.Strapi,
  studentId: number,
  courseId: string,
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
