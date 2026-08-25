/**
 * lesson controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, narrow, roleName, seesEveryRow } from '../../../utils/caller';

const UID = 'api::lesson.lesson';

// A lesson is only ever read from inside a course, so there is no catalogue of every lesson to
// browse. Students get the lessons of courses they enrolled in, instructors the lessons of the
// courses they own, and the two roles that manage the library get all of them.
const visibleTo = (ctx: Context) => {
  const me = caller(ctx).id;

  return roleName(ctx) === 'Student'
    ? { course: { enrollments: { student: { id: me } } } }
    : { course: { owner: { id: me } } };
};

export default factories.createCoreController(UID, ({ strapi }) => ({
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

      // 404 rather than 403, so a student cannot use the status code to learn which lessons a
      // course they have not paid for contains.
      if (!visible) return ctx.notFound();
    }

    return super.findOne(ctx);
  },
}));
