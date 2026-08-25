/**
 * lesson controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { courseScope, narrow, seesEveryRow } from '../../../utils/caller';

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
        limit: 1,
      });

      // 404 rather than 403, so a student cannot use the status code to learn which lessons a
      // course they have not enrolled in contains.
      if (!visible) return ctx.notFound();
    }

    return super.findOne(ctx);
  },
}));
