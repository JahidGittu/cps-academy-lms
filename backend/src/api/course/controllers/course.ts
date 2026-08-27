import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, narrow, roleName, seesEveryRow } from '../../../utils/caller';

const UID = 'api::course.course';

// Safe course relations shape to expose
const INSIDE = {
  lessons: { fields: 'title,order', sort: 'order:asc' },
  quiz: { fields: 'title' },
  owner: { fields: 'username' },
} as const;

const mayEdit = (ctx: Context, ownerId?: string | number | null) => {
  if (!ctx.state.user) return false;
  return seesEveryRow(ctx) || ownerId === caller(ctx).id;
};

type Enrolled = { student?: { id: string | number; username?: string | null } | null };

type Raw = {
  documentId: string;
  owner?: { id: string | number; username?: string | null } | null;
  lessons?: { id: number; documentId: string; title: string; order: number }[];
  quiz?: { id: number; documentId: string; title: string } | null;
};

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

type Writable = { title?: string; description?: string; coverImageUrl?: string };

const completionsPerStudent = (rows: Enrolled[]) => {
  const counts = new Map<string | number, number>();

  for (const row of rows) {
    const id = row.student?.id;
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return counts;
};

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx: Context) {
    const body = ctx.request.body as { data?: Writable };
    const { title, description, coverImageUrl } = body.data ?? {};

    if (!title) return ctx.badRequest('data.title is required');

    // Force owner from current session
    const course = await strapi.documents(UID).create({
      data: { title, description, coverImageUrl, owner: caller(ctx).id },
    });

    ctx.status = 201;
    return super.transformResponse(await super.sanitizeOutput(course, ctx));
  },

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
    const mine = ctx.query.mine === 'true';
    delete ctx.query.mine;

    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    // Filter by owner if instructor requests own courses
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

  // Calculate dynamic progress per student to prevent stale numbers
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
        username: student?.username ?? null,
        completedLessons: done,
        percentComplete: totalLessons ? Math.round((done / totalLessons) * 100) : 0,
        quizScore: attempt?.score ?? null,
        quizTotal: attempt?.total ?? null,
      };
    });

    return { data: { totalLessons, students } };
  },
}));
