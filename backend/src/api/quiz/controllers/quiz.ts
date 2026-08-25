/**
 * quiz controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { courseScope, narrow, roleName, seesEveryRow } from '../../../utils/caller';

const UID = 'api::quiz.quiz';

type Question = { correctIndex?: number };

// correctIndex is an ordinary component field, so it is returned with the quiz like any other and
// the answer key ships to whoever asks for the questions. Grading runs on the server, so a student
// has no use for it. Both find and findOne come through here, hence the array and object handling.
const hideAnswers = (response: unknown) => {
  const data = (response as { data?: unknown })?.data;

  for (const row of Array.isArray(data) ? data : [data]) {
    for (const question of ((row as { questions?: Question[] })?.questions ?? [])) {
      delete question.correctIndex;
    }
  }

  return response;
};

export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(ctx: Context) {
    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    if (!seesEveryRow(ctx)) narrow(query, courseScope(ctx));

    const { results, pagination } = await strapi.service(UID).find(query);

    // transformResponse is async, so the answers would be stripped off a pending promise and the
    // real rows would go out untouched.
    const response = await super.transformResponse(await super.sanitizeOutput(results, ctx), { pagination });

    return roleName(ctx) === 'Student' ? hideAnswers(response) : response;
  },

  async findOne(ctx: Context) {
    if (!seesEveryRow(ctx)) {
      const [visible] = await strapi.documents(UID).findMany({
        filters: { documentId: ctx.params.id, ...courseScope(ctx) },
        limit: 1,
      });

      if (!visible) return ctx.notFound();
    }

    const response = await super.findOne(ctx);

    return roleName(ctx) === 'Student' ? hideAnswers(response) : response;
  },
}));
