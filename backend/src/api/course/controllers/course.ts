/**
 * course controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, roleName, seesEveryRow } from '../../../utils/caller';

const UID = 'api::course.course';

// What a course read says about the things inside it. Lesson bodies and quiz questions are missing
// on purpose: those come from /api/lessons/:id and /api/quizzes/:id, which check enrollment and
// strip the answer key, and populating them through the course walks past both. Written here rather
// than read off ctx.query, because a shape the client picks is a shape the client can widen.
const INSIDE = {
  lessons: { fields: 'title,order', sort: 'order:asc' },
  quiz: { fields: 'title' },
} as const;

// Relation ids are string or number in Strapi's own types, so the roster is keyed on whatever came
// back rather than converted to one of them.
type Enrolled = { student?: { id: string | number; username?: string | null } | null };

// One row per completion, so the number of rows a student has is the number of lessons they have
// finished. Counting them together keeps this to one query for the whole roster.
const completionsPerStudent = (rows: Enrolled[]) => {
  const counts = new Map<string | number, number>();

  for (const row of rows) {
    const id = row.student?.id;

    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return counts;
};

export default factories.createCoreController(UID, ({ strapi }) => ({
  // The owner is the account that made the request. Sent in the body it would let one instructor
  // file a course under another's name, and the ownership policy would then hand them the course.
  // The three writable fields are named rather than taken from the body wholesale, so a field the
  // client should not be setting cannot arrive by being added to the schema later.
  async create(ctx: Context) {
    const body = ctx.request.body as {
      data?: { title?: string; description?: string; coverImageUrl?: string };
    };

    const { title, description, coverImageUrl } = body.data ?? {};

    if (!title) return ctx.badRequest('data.title is required');

    const course = await strapi.documents(UID).create({
      data: { title, description, coverImageUrl, owner: caller(ctx).id },
    });

    ctx.status = 201;

    return super.transformResponse(await super.sanitizeOutput(course, ctx));
  },

  async find(ctx: Context) {
    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    const { results, pagination } = await strapi.service(UID).find({ ...query, populate: INSIDE });

    return super.transformResponse(await super.sanitizeOutput(results, ctx), { pagination });
  },

  async findOne(ctx: Context) {
    const course = await strapi.documents(UID).findOne({
      documentId: ctx.params.id,
      populate: INSIDE,
    });

    if (!course) return ctx.notFound();

    return super.transformResponse(await super.sanitizeOutput(course, ctx));
  },

  // Percentages are counted per request instead of stored, so they cannot drift away from the
  // lessons and completion rows they are derived from. The answer has the same shape for every
  // role: a student gets a roster containing only themselves.
  async progress(ctx: Context) {
    const course = await strapi.documents(UID).findOne({
      documentId: ctx.params.id,
      populate: { lessons: true, owner: true, quiz: true },
    });

    if (!course) return ctx.notFound();

    const me = caller(ctx).id;
    const isStudent = roleName(ctx) === 'Student';

    if (isStudent) {
      const [enrolled] = await strapi.documents('api::enrollment.enrollment').findMany({
        filters: { student: { id: me }, course: { documentId: course.documentId } },
        limit: 1,
      });

      // 404 for the reason the lesson gate uses it: the status code should not tell a student
      // which courses exist that they cannot see.
      if (!enrolled) return ctx.notFound();
    } else if (!seesEveryRow(ctx) && course.owner?.id !== me) {
      return ctx.notFound();
    }

    const mineOnly = isStudent ? { student: { id: me } } : {};

    const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: { course: { documentId: course.documentId }, ...mineOnly },
      populate: { student: true },
    });

    const completions = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
      filters: { lesson: { course: { documentId: course.documentId } }, ...mineOnly },
      populate: { student: true },
    });

    const attempts = course.quiz
      ? await strapi.documents('api::quiz-result.quiz-result').findMany({
          filters: { quiz: { documentId: course.quiz.documentId }, ...mineOnly },
          populate: { student: true },
        })
      : [];

    const totalLessons = (course.lessons ?? []).length;
    const completed = completionsPerStudent(completions);

    const students = enrollments.map((enrollment) => {
      const student = enrollment.student;
      const id = student?.id ?? 0;
      const done = completed.get(id) ?? 0;
      const attempt = attempts.find((row) => row.student?.id === id);

      return {
        id,
        // sanitizeOutput drops the student relation from completions and quiz results for every
        // role below Admin, because reading the user collection is an Admin-only permission.
        // Read here on the server instead, and only for a roster the caller already has access
        // to, which is narrower than handing an instructor user.find.
        username: student?.username ?? null,
        completedLessons: done,
        percentComplete: totalLessons ? Math.round((done / totalLessons) * 100) : 0,
        quizScore: attempt?.score ?? null,
        quizTotal: attempt?.total ?? null,
      };
    });

    // Not transformResponse: this is a count, not a document, so it has no id or attributes to
    // reshape and nothing here came out of the database unfiltered.
    return { data: { totalLessons, students } };
  },
}));
