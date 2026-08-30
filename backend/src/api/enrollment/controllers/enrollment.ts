import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, narrow, roleName, seesEveryRow } from '../../../utils/caller';


const UID = 'api::enrollment.enrollment';


export default factories.createCoreController(UID, ({ strapi }) => ({

  // studentId is always taken from the JWT — never trusted from the request body
  async create(ctx: Context) {
    const me     = caller(ctx).id;
    const body   = ctx.request.body as { data?: { course?: unknown } };
    const courseId = body.data?.course;

    if (typeof courseId !== 'string') return ctx.badRequest('data.course must be a course documentId');

    const course = await strapi.documents('api::course.course').findOne({ documentId: courseId });
    if (!course) return ctx.notFound('course not found');

    // prevent duplicate enrollments
    const [duplicate] = await strapi.documents(UID).findMany({
      filters: { student: { id: me }, course: { documentId: courseId } },
      limit: 1,
    });

    if (duplicate) return ctx.badRequest('already enrolled in this course');

    const enrollment = await strapi.documents(UID).create({
      data: { student: me, course: courseId },
      populate: ['course'],
    });

    ctx.status = 201;
    return super.transformResponse(await super.sanitizeOutput(enrollment, ctx));
  },


  async find(ctx: Context) {
    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    if (!seesEveryRow(ctx)) {
      const me = caller(ctx).id;
      // students see their own enrollments; instructors see enrollments for their courses
      narrow(query, roleName(ctx) === 'Student'
        ? { student: { id: me } }
        : { course: { owner: { id: me } } }
      );
    }

    const { results, pagination } = await strapi.service(UID).find(query);
    return super.transformResponse(await super.sanitizeOutput(results, ctx), { pagination });
  },


  async findOne(ctx: Context) {
    if (!seesEveryRow(ctx)) {
      const me = caller(ctx).id;

      const enrollment = await strapi.documents(UID).findOne({
        documentId: ctx.params.id,
        populate: { student: true, course: { populate: ['owner'] } },
      });

      const mine = enrollment?.student?.id === me || enrollment?.course?.owner?.id === me;
      if (!mine) return ctx.notFound();
    }

    return super.findOne(ctx);
  },


  async delete(ctx: Context) {
    // admin can delete any enrollment; others can only delete their own
    if (roleName(ctx) !== 'Admin') {
      const me = caller(ctx).id;

      const enrollment = await strapi.documents(UID).findOne({
        documentId: ctx.params.id,
        populate: { student: true },
      });

      if (enrollment?.student?.id !== me) return ctx.notFound();
    }

    return super.delete(ctx);
  },

}));
