/**
 * enrollment controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, narrow, roleName, seesEveryRow } from '../../../utils/caller';

const UID = 'api::enrollment.enrollment';

export default factories.createCoreController(UID, ({ strapi }) => ({
  // The student comes from the session, never from the body, or one signed in user could enroll
  // another. That rules out super.create: it validates the body against what the caller's role may
  // write, and a Student may not write a relation to the user collection even to point at itself.
  async create(ctx: Context) {
    const me = caller(ctx).id;
    const body = ctx.request.body as { data?: { course?: unknown } };
    const courseId = body.data?.course;

    if (typeof courseId !== 'string') {
      return ctx.badRequest('data.course must be a course documentId');
    }

    const course = await strapi.documents('api::course.course').findOne({ documentId: courseId });

    if (!course) return ctx.notFound('course not found');

    const [duplicate] = await strapi.documents(UID).findMany({
      filters: { student: { id: me }, course: { documentId: courseId } },
      limit: 1,
    });

    // No pair of fields can be made unique in the schema, so the second enrollment is caught here.
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

      // Students see their own enrollments, instructors the enrollments on courses they own. An
      // unexpected role lands in the second branch and sees nothing, which is the safe way round.
      narrow(
        query,
        roleName(ctx) === 'Student' ? { student: { id: me } } : { course: { owner: { id: me } } }
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

      // 404 rather than 403: a 403 would confirm the row exists to someone allowed nowhere near it.
      if (!mine) return ctx.notFound();
    }

    return super.findOne(ctx);
  },

  // Unenrolling is the student's own decision. Admin can also remove one as platform cleanup.
  async delete(ctx: Context) {
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
