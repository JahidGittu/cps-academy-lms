/**
 * course controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, narrow, roleName, seesEveryRow } from '../../../utils/caller';

const UID = 'api::course.course';

// What a course read says about the things inside it. Lesson bodies and quiz questions are missing
// on purpose: those come from /api/lessons/:id and /api/quizzes/:id, which check enrollment and
// strip the answer key, and populating them through the course walks past both. Written here rather
// than read off ctx.query, because a shape the client picks is a shape the client can widen.
const INSIDE = {
  lessons: { fields: 'title,order', sort: 'order:asc' },
  quiz: { fields: 'title' },
  owner: { fields: 'username' },
} as const;

// The line is-course-owner draws on a write. The client needs the same answer to decide whether to
// offer an edit button, and it cannot work it out for itself: the sanitizer removes the owner
// relation for every role below Admin. So the answer travels rather than the ids.
const mayEdit = (ctx: Context, ownerId?: string | number | null) => {
  // Anonymous requests reach the two reads below, since the catalogue is public. Nobody signed out
  // may edit anything, so the answer is no before caller gets a chance to refuse the request.
  if (!ctx.state.user) return false;

  return seesEveryRow(ctx) || ownerId === caller(ctx).id;
};

// Relation ids are string or number in Strapi's own types, so the roster is keyed on whatever came
// back rather than converted to one of them.
type Enrolled = { student?: { id: string | number; username?: string | null } | null };

// The shape INSIDE actually asks for, which is narrower than the schema. Written out because the
// reads below take these off a raw document, before the sanitizer has been anywhere near it.
type Raw = {
  documentId: string;
  owner?: { id: string | number; username?: string | null } | null;
  lessons?: { id: number; documentId: string; title: string; order: number }[];
  quiz?: { id: number; documentId: string; title: string } | null;
};

// What a course read says on top of its own columns, and all of it is an answer rather than a
// relation. sanitizeOutput removes a relation the calling role may not read, which for a Student is
// the owner and for a visitor with no account is the syllabus and the quiz as well. Handing Public
// find on the lessons and quizzes collections to get titles through the sanitizer would be far wider
// than putting the three titles back here.
const extras = (ctx: Context, course: Raw) => ({
  owned: mayEdit(ctx, course.owner?.id),
  instructor: course.owner?.username ?? null,
  lessons: (course.lessons ?? []).map(({ id, documentId, title, order }) => ({
    id,
    documentId,
    title,
    order,
  })),
  quiz: course.quiz
    ? { id: course.quiz.id, documentId: course.quiz.documentId, title: course.quiz.title }
    : null,
});

// Everything a course form may set. The rest of the schema is either derived (owner) or filled in
// through another route (lessons, quiz), and both writes below name these three rather than passing
// the body along, so a field left out here is a field no client can reach.
type Writable = { title?: string; description?: string; coverImageUrl?: string };

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
  async create(ctx: Context) {
    const body = ctx.request.body as { data?: Writable };

    const { title, description, coverImageUrl } = body.data ?? {};

    if (!title) return ctx.badRequest('data.title is required');

    const course = await strapi.documents(UID).create({
      data: { title, description, coverImageUrl, owner: caller(ctx).id },
    });

    ctx.status = 201;

    return super.transformResponse(await super.sanitizeOutput(course, ctx));
  },

  // is-course-owner has already said the caller may change this course. What it cannot say is which
  // fields, and the core update writes whatever the body holds: owner would move the course to
  // another account, and lessons would pull another course's lessons into this one.
  async update(ctx: Context) {
    const body = ctx.request.body as { data?: Writable };

    const { title, description, coverImageUrl } = body.data ?? {};

    const course = await strapi.documents(UID).update({
      documentId: ctx.params.id,
      data: { title, description, coverImageUrl },
    });

    if (!course) return ctx.notFound();

    return super.transformResponse(await super.sanitizeOutput(course, ctx));
  },

  async find(ctx: Context) {
    // Taken off the query before validateQuery sees it, which rejects any key that is not part of
    // Strapi's own query language. Asking for the caller's own courses as filters[owner] is not an
    // option either: validateQuery also rejects a filter on a relation the caller may not read,
    // and the user collection is one of those for every role below Admin.
    const mine = ctx.query.mine === 'true';

    delete ctx.query.mine;

    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    // Whose courses these are is a different question from which courses the caller may change, and
    // it is the second one a manage screen is asking. For an instructor that is the courses they
    // own; for the two roles that run the library it is all of them, so nothing is narrowed.
    if (mine && !seesEveryRow(ctx)) narrow(query, { owner: { id: caller(ctx).id } });

    const { results, pagination } = await strapi.service(UID).find({ ...query, populate: INSIDE });

    const added = new Map(
      (results as Raw[]).map((course) => [course.documentId, extras(ctx, course)])
    );

    const rows = await super.sanitizeOutput(results, ctx);

    return super.transformResponse(
      rows.map((row: Raw) => ({ ...row, ...added.get(row.documentId) })),
      { pagination }
    );
  },

  async findOne(ctx: Context) {
    const course = await strapi.documents(UID).findOne({
      documentId: ctx.params.id,
      populate: INSIDE,
    });

    if (!course) return ctx.notFound();

    const row = await super.sanitizeOutput(course, ctx);

    return super.transformResponse({ ...row, ...extras(ctx, course as Raw) });
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
          // Newest first, because a quiz can be retaken and the row picked out below is the first
          // one that matches the student. Without the sort a retake would leave the roster showing
          // whichever attempt the database happened to hand over.
          sort: 'createdAt:desc',
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
