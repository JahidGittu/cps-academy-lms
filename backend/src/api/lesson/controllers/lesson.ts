/**
 * lesson controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, courseScope, narrow, roleName, seesEveryRow } from '../../../utils/caller';
import { unfinishedLessonBefore } from '../../../utils/sequence';

const UID = 'api::lesson.lesson';

export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(ctx: Context) {
    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    if (!seesEveryRow(ctx)) narrow(query, courseScope(ctx));

    const { results, pagination } = await strapi.service(UID).find(query);

    return super.transformResponse(await super.sanitizeOutput(results, ctx), { pagination });
  },

  async findOne(ctx: Context) {
    if (!seesEveryRow(ctx)) {
      const [visible] = await strapi.documents(UID).findMany({
        filters: { documentId: ctx.params.id, ...courseScope(ctx) },
        fields: ['title', 'order'],
        populate: { course: { fields: ['title'] } },
        limit: 1,
      });

      // 404 rather than 403, so a student cannot use the status code to learn which lessons a
      // course they have not enrolled in contains.
      if (!visible) return ctx.notFound();

      if (roleName(ctx) === 'Student') {
        const course = visible.course as { documentId?: string } | null;

        const blocking = course?.documentId
          ? await unfinishedLessonBefore(strapi, caller(ctx).id, course.documentId, visible.order)
          : null;

        // 403 with the title in it, not the 404 above. An enrolled student is already looking at
        // the whole syllabus on the course page, so there is nothing left to hide here, and being
        // told which lesson to finish is the only useful thing to say.
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

    const me = caller(ctx).id;
    const isOwner = (lesson.course as { owner?: { id?: number } } | null)?.owner?.id === me;
    if (!seesEveryRow(ctx) && !isOwner) {
      return ctx.forbidden();
    }

    // Cascade delete any student progresses for this lesson
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
