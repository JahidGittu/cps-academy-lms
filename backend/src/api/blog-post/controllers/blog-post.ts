/**
 * blog-post controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, narrow, seesEveryRow } from '../../../utils/caller';

const UID = 'api::blog-post.blog-post';

// Draft and Publish is off on every collection here, so publishState is an ordinary field and a
// draft is returned like anything else. Only the two roles the matrix lets manage the blog see
// them; for everyone else, including anonymous visitors, the query is forced to published.
const PUBLISHED_ONLY = { publishState: 'published' } as const;

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx: Context) {
    const body = ctx.request.body as {
      data?: { title?: string; body?: string; coverImageUrl?: string; publishState?: string };
    };

    const { title, body: postBody, coverImageUrl, publishState } = body.data ?? {};

    if (!title) return ctx.badRequest('data.title is required');
    if (!postBody) return ctx.badRequest('data.body is required');

    const post = await strapi.documents(UID).create({
      data: {
        title,
        body: postBody,
        coverImageUrl,
        publishState: publishState === 'published' ? 'published' : 'draft',
        author: caller(ctx).id,
      },
    });

    ctx.status = 201;

    return super.transformResponse(await super.sanitizeOutput(post, ctx));
  },

  async find(ctx: Context) {
    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    if (!seesEveryRow(ctx)) narrow(query, PUBLISHED_ONLY);

    const { results, pagination } = await strapi.service(UID).find(query);

    return super.transformResponse(await super.sanitizeOutput(results, ctx), { pagination });
  },

  async findOne(ctx: Context) {
    if (!seesEveryRow(ctx)) {
      const [visible] = await strapi.documents(UID).findMany({
        filters: { documentId: ctx.params.id, ...PUBLISHED_ONLY },
        limit: 1,
      });

      // 404 rather than 403: an unpublished post should read as not being there yet, not as
      // something that exists and is being withheld.
      if (!visible) return ctx.notFound();
    }

    return super.findOne(ctx);
  },
}));
