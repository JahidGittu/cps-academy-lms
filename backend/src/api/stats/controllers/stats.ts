/**
 * stats controller
 */

import type { Core } from '@strapi/strapi';

import { roles } from '../../../permissions';

// Counts for the admin dashboard, in one request rather than six. There is no Stats collection
// behind this, so nothing for createCoreController to wrap; Strapi registers the route from
// routes/stats.ts either way, which is what gives it a permission to sit behind. Only Admin holds
// that permission, so the handler itself has no role check to make.
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find() {
    const users = await Promise.all(
      roles.map(async ({ name }) => ({
        role: name,
        count: await strapi.db
          .query('plugin::users-permissions.user')
          .count({ where: { role: { name } } }),
      }))
    );

    const posts = strapi.db.query('api::blog-post.blog-post');

    return {
      data: {
        users,
        courses: await strapi.db.query('api::course.course').count(),
        lessons: await strapi.db.query('api::lesson.lesson').count(),
        enrollments: await strapi.db.query('api::enrollment.enrollment').count(),
        quizAttempts: await strapi.db.query('api::quiz-result.quiz-result').count(),
        blogPosts: {
          published: await posts.count({ where: { publishState: 'published' } }),
          drafts: await posts.count({ where: { publishState: 'draft' } }),
        },
      },
    };
  },
});
