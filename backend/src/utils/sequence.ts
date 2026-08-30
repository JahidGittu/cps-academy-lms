import type { Core } from '@strapi/strapi';


type Lesson = { documentId: string; title?: string | null; order?: number | null };


// returns the earliest incomplete lesson that comes before `order` in the course,
// or null if the student may proceed to the requested lesson
export const unfinishedLessonBefore = async (
  strapi: Core.Strapi,
  studentId: number,
  courseId:  string,
  order?:    number | null,
): Promise<Lesson | null> => {
  if (typeof order !== 'number') return null;

  // all lessons in this course that come before the requested one
  const earlier = (await strapi.documents('api::lesson.lesson').findMany({
    filters: { course: { documentId: courseId }, order: { $lt: order } },
    fields:  ['title', 'order'],
    sort:    'order:asc',
  })) as Lesson[];

  if (!earlier.length) return null;

  // which of those has the student already finished?
  const done = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
    filters: {
      student: { id: studentId },
      lesson:  { documentId: { $in: earlier.map((l) => l.documentId) } },
    },
    populate: { lesson: { fields: ['title'] } },
  });

  const finished = new Set(done.map((row) => (row.lesson as Lesson | null)?.documentId));

  // return the first earlier lesson not yet finished, or null if all done
  return earlier.find((lesson) => !finished.has(lesson.documentId)) ?? null;
};
