/**
 * quiz controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { courseScope, narrow, seesEveryRow } from '../../../utils/caller';

const UID = 'api::quiz.quiz';

// This file decides who may read a quiz, not what a quiz says. The answer key is kept out of every
// response by marking correctIndex private in components/quiz/question.json, because a quiz travels
// as a populated relation on courses, lessons, enrollments and past results, and a check written
// here would only have covered the two routes below.
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

      if (!visible) return ctx.notFound();
    }

    return super.findOne(ctx);
  },
}));
