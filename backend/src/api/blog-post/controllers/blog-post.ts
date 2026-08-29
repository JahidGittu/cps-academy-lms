import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

import { caller, narrow, seesEveryRow } from '../../../utils/caller';

const UID = 'api::blog-post.blog-post';

const PUBLISHED_ONLY = { publishState: 'published' } as const;

type Writable = { title?: string; body?: string; coverImageUrl?: string; topic?: string; publishState?: string };

const stateOf = (value?: string) => (value === 'published' ? 'published' : 'draft');

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx: Context) {
    const body = ctx.request.body as { data?: Writable };
    const { title, body: postBody, coverImageUrl, topic, publishState } = body.data ?? {};

    if (!title) return ctx.badRequest('data.title is required');
    if (!postBody) return ctx.badRequest('data.body is required');

    const post = await strapi.documents(UID).create({
      data: {
        title,
        body: postBody,
        coverImageUrl,
        topic,
        publishState: stateOf(publishState),
        author: caller(ctx).id,
      },
    });

    ctx.status = 201;
    return super.transformResponse(await super.sanitizeOutput(post, ctx));
  },

  async update(ctx: Context) {
    const body = ctx.request.body as { data?: Writable };
    const { title, body: postBody, coverImageUrl, topic, publishState } = body.data ?? {};

    const post = await strapi.documents(UID).update({
      documentId: ctx.params.id,
      data: {
        title,
        body: postBody,
        coverImageUrl,
        topic,
        publishState: stateOf(publishState),
      },
    });

    if (!post) return ctx.notFound();
    return super.transformResponse(await super.sanitizeOutput(post, ctx));
  },

  async find(ctx: Context) {
    await super.validateQuery(ctx);
    const query = await super.sanitizeQuery(ctx);

    // Limit public and student views strictly to published posts
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

      if (!visible) return ctx.notFound();
    }

    return super.findOne(ctx);
  },
}));
