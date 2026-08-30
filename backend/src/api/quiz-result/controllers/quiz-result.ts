import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, narrow, roleName, seesEveryRow } from '../../../utils/caller';
import { grade } from '../../../utils/grade';


const UID = 'api::quiz-result.quiz-result';

type Question = { correctIndex?: number | null };


// students see their own results; instructors see results for their own courses
const visibleTo = (ctx: Context) => {
  const me = caller(ctx).id;
  return roleName(ctx) === 'Student'
    ? { student: { id: me } }
    : { quiz: { course: { owner: { id: me } } } };
};


export default factories.createCoreController(UID, ({ strapi }) => ({

  // grading happens here on the server — the client only sends picked option indexes
  async create(ctx: Context) {
    const body = ctx.request.body as { data?: { quiz?: unknown; answers?: unknown } };
    const { quiz: quizId, answers } = body.data ?? {};

    if (typeof quizId !== 'string') return ctx.badRequest('data.quiz must be a document id');
    if (!Array.isArray(answers))    return ctx.badRequest('data.answers must be an array of picked option indexes');

    const me = caller(ctx).id;

    const quiz = await strapi.documents('api::quiz.quiz').findOne({
      documentId: quizId,
      populate: { questions: true, course: true },
    });

    if (!quiz?.course) return ctx.notFound();

    // student must be enrolled before they can submit
    const [enrolled] = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: { student: { id: me }, course: { documentId: quiz.course.documentId } },
      limit: 1,
    });

    if (!enrolled) return ctx.forbidden('enroll in the course before taking its quiz');

    // server computes the score — client cannot send a fake number
    const questions = (quiz.questions ?? []) as Question[];
    const score     = grade(questions, answers);

    const result = await strapi.documents(UID).create({
      data: { student: me, quiz: quizId, answers, score, total: questions.length },
    });

    ctx.status = 201;
    return super.transformResponse(await super.sanitizeOutput(result, ctx));
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

}));
