import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, courseScope, narrow, seesEveryRow } from '../../../utils/caller';


const UID = 'api::quiz.quiz';


// This controller only decides who may read a quiz — not what it says.
// The correctIndex field is kept out of every response by marking it private in
// components/quiz/question.json, so the answer key cannot leak through any route.
export default factories.createCoreController(UID, ({ strapi }) => ({

  async find(ctx: Context) {
    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    // students see quizzes for enrolled courses; instructors see their own
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


  // private endpoint — returns correctIndex for the quiz builder screen only.
  // sanitizeOutput strips that field from every other route, so this is the only
  // safe way for an instructor to see which answer is marked correct.
  async answers(ctx: Context) {
    const quiz = await strapi.documents(UID).findOne({
      documentId: ctx.params.id,
      populate: { questions: true },
    });

    if (!quiz) return ctx.notFound();

    return {
      data: {
        title:     quiz.title,
        questions: (quiz.questions ?? []).map((q) => ({
          text:         q.text,
          options:      q.options,
          correctIndex: q.correctIndex,
        })),
      },
    };
  },


  async delete(ctx: Context) {
    const quiz = await strapi.documents(UID).findOne({
      documentId: ctx.params.id,
      populate: { course: { populate: ['owner'] } },
    });

    if (!quiz) return ctx.notFound();

    // instructors may only delete quizzes from their own courses
    const me      = caller(ctx).id;
    const isOwner = (quiz.course as { owner?: { id?: number } } | null)?.owner?.id === me;
    if (!seesEveryRow(ctx) && !isOwner) return ctx.forbidden();

    // remove any submitted results first to avoid orphaned rows
    const results = await strapi.documents('api::quiz-result.quiz-result').findMany({
      filters: { quiz: { documentId: quiz.documentId } },
    });
    for (const qr of results) {
      await strapi.documents('api::quiz-result.quiz-result').delete({ documentId: qr.documentId });
    }

    await strapi.documents(UID).delete({ documentId: ctx.params.id });
    return ctx.send({ data: { documentId: ctx.params.id, deleted: true } });
  },

}));
