/**
 * course controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller } from '../../../utils/caller';

const UID = 'api::course.course';

export default factories.createCoreController(UID, ({ strapi }) => ({
  // The owner is the account that made the request. Sent in the body it would let one instructor
  // file a course under another's name, and the ownership policy would then hand them the course.
  // The three writable fields are named rather than taken from the body wholesale, so a field the
  // client should not be setting cannot arrive by being added to the schema later.
  async create(ctx: Context) {
    const body = ctx.request.body as {
      data?: { title?: string; description?: string; coverImageUrl?: string };
    };

    const { title, description, coverImageUrl } = body.data ?? {};

    if (!title) return ctx.badRequest('data.title is required');

    const course = await strapi.documents(UID).create({
      data: { title, description, coverImageUrl, owner: caller(ctx).id },
    });

    ctx.status = 201;

    return super.transformResponse(await super.sanitizeOutput(course, ctx));
  },
}));
