/**
 * lesson-progress controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, narrow, roleName, seesEveryRow } from '../../../utils/caller';
import { unfinishedLessonBefore } from '../../../utils/sequence';

const UID = 'api::lesson-progress.lesson-progress';

const visibleTo = (ctx: Context) => {
  const me = caller(ctx).id;

  return roleName(ctx) === 'Student'
    ? { student: { id: me } }
    : { lesson: { course: { owner: { id: me } } } };
};

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx: Context) {
    const body = ctx.request.body as { data?: { lesson?: unknown } };
    const lessonId = body.data?.lesson;

    if (typeof lessonId !== 'string') return ctx.badRequest('data.lesson must be a document id');

    const me = caller(ctx).id;

    const lesson = await strapi.documents('api::lesson.lesson').findOne({
      documentId: lessonId,
      populate: { course: true },
    });

    if (!lesson?.course) return ctx.notFound();

    const [enrolled] = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: { student: { id: me }, course: { documentId: lesson.course.documentId } },
      limit: 1,
    });

    if (!enrolled) return ctx.forbidden('enroll in the course before completing its lessons');

    // The order is enforced on the way in as well as on the read. Without this a student could post
    // a completion for the last lesson and walk back through the course with everything unlocked,
    // since unlocking only ever looks at what has been marked done.
    const blocking = await unfinishedLessonBefore(
      strapi,
      me,
      lesson.course.documentId,
      lesson.order
    );

    if (blocking) return ctx.forbidden(`finish "${blocking.title}" first`);

    // No pair of fields can be made unique in the schema, so the second row has to be stopped
    // here. Marking a lesson done twice is a double click rather than an error, so the row that
    // already exists is returned instead of a 400, and the completed count cannot pass the
    // lesson count and push progress over 100 percent.
    const [already] = await strapi.documents(UID).findMany({
      filters: { student: { id: me }, lesson: { documentId: lessonId } },
      limit: 1,
    });

    if (already) return super.transformResponse(await super.sanitizeOutput(already, ctx));

    const progress = await strapi.documents(UID).create({
      data: { student: me, lesson: lessonId },
    });

    ctx.status = 201;

    return super.transformResponse(await super.sanitizeOutput(progress, ctx));
  },

  async find(ctx: Context) {
    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    if (!seesEveryRow(ctx)) narrow(query, visibleTo(ctx));

    const { results, pagination } = await strapi.service(UID).find(query);

    return super.transformResponse(await super.sanitizeOutput(results, ctx), { pagination });
  },

  async findOne(ctx: Context) {
    if (!seesEveryRow(ctx)) {
      const [visible] = await strapi.documents(UID).findMany({
        filters: { documentId: ctx.params.id, ...visibleTo(ctx) },
        limit: 1,
      });

      if (!visible) return ctx.notFound();
    }

    return super.findOne(ctx);
  },

  async delete(ctx: Context) {
    if (!seesEveryRow(ctx)) {
      const [visible] = await strapi.documents(UID).findMany({
        filters: { documentId: ctx.params.id, ...visibleTo(ctx) },
        limit: 1,
      });

      if (!visible) return ctx.notFound();
    }

    return super.delete(ctx);
  },
}));
