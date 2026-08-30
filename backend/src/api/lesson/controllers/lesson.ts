import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, courseScope, narrow, roleName, seesEveryRow } from '../../../utils/caller';
import { unfinishedLessonBefore } from '../../../utils/sequence';


const UID = 'api::lesson.lesson';


export default factories.createCoreController(UID, ({ strapi }) => ({

  async find(ctx: Context) {
    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    // students see only lessons in their enrolled courses; instructors see their own
    if (!seesEveryRow(ctx)) narrow(query, courseScope(ctx));

    const { results, pagination } = await strapi.service(UID).find(query);
    return super.transformResponse(await super.sanitizeOutput(results, ctx), { pagination });
  },


  async findOne(ctx: Context) {
    if (!seesEveryRow(ctx)) {
      const [visible] = await strapi.documents(UID).findMany({
        filters: { documentId: ctx.params.id, ...courseScope(ctx) },
        fields:  ['title', 'order'],
        populate: { course: { fields: ['title'] } },
        limit: 1,
      });

      // 404 rather than 403 — a student shouldn't be able to confirm whether a lesson exists
      // in a course they haven't enrolled in
      if (!visible) return ctx.notFound();

      // sequential lock: tell the student which lesson to finish first
      if (roleName(ctx) === 'Student') {
        const course = visible.course as { documentId?: string } | null;

        const blocking = course?.documentId
          ? await unfinishedLessonBefore(strapi, caller(ctx).id, course.documentId, visible.order)
          : null;

        if (blocking) return ctx.forbidden(`finish "${blocking.title}" first`);
      }
    }

    return super.findOne(ctx);
  },


  async delete(ctx: Context) {
    const lesson = await strapi.documents(UID).findOne({
      documentId: ctx.params.id,
      populate: { course: { populate: ['owner'] } },
    });

    if (!lesson) return ctx.notFound();

    // instructors may only delete lessons from their own courses
    const me      = caller(ctx).id;
    const isOwner = (lesson.course as { owner?: { id?: number } } | null)?.owner?.id === me;
    if (!seesEveryRow(ctx) && !isOwner) return ctx.forbidden();

    // clean up any student progress records for this lesson first
    const progresses = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
      filters: { lesson: { documentId: lesson.documentId } },
    });
    for (const lp of progresses) {
      await strapi.documents('api::lesson-progress.lesson-progress').delete({ documentId: lp.documentId });
    }

    await strapi.documents(UID).delete({ documentId: ctx.params.id });
    return ctx.send({ data: { documentId: ctx.params.id, deleted: true } });
  },

}));
