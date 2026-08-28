/**
 * quiz controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, courseScope, narrow, seesEveryRow } from '../../../utils/caller';

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

  // The edit screen has to show which option is currently marked correct, and no ordinary read can
  // carry that: private strips the field on the way out for everybody, the author included. So the
  // key has a route of its own, behind the same ownership policy as the writes.
  async answers(ctx: Context) {
    const quiz = await strapi.documents(UID).findOne({
      documentId: ctx.params.id,
      populate: { questions: true },
    });

    if (!quiz) return ctx.notFound();

    // Neither sanitizeOutput nor transformResponse: the first is what removes correctIndex, and this
    // is an answer key rather than a document for a page to render.
    return {
      data: {
        title: quiz.title,
        questions: (quiz.questions ?? []).map((question) => ({
          text: question.text,
          options: question.options,
          correctIndex: question.correctIndex,
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

    const me = caller(ctx).id;
    const isOwner = (quiz.course as { owner?: { id?: number } } | null)?.owner?.id === me;
    if (!seesEveryRow(ctx) && !isOwner) {
      return ctx.forbidden();
    }

    // Cascade delete quiz results
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
