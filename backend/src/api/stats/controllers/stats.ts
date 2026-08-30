import type { Core } from '@strapi/strapi';

import { roles } from '../../../permissions';


// aggregates platform stats in a single request for the admin dashboard
// permission for this endpoint is Admin-only (set in permissions.ts), so no role check here
export default ({ strapi }: { strapi: Core.Strapi }) => ({

  async find() {
    // user count broken down by role
    const users = await Promise.all(
      roles.map(async ({ name }) => ({
        role:  name,
        count: await strapi.db
          .query('plugin::users-permissions.user')
          .count({ where: { role: { name } } }),
      }))
    );

    const posts       = strapi.db.query('api::blog-post.blog-post');
    const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({ populate: ['student', 'course'] });
    const quizAttempts = await strapi.documents('api::quiz-result.quiz-result').findMany({ populate: ['student', 'quiz'] });

    // filter out orphaned rows that reference a deleted student or course
    const validEnrollments  = enrollments.filter((e)  => Boolean(e.student && e.course)).length;
    const validQuizAttempts = quizAttempts.filter((q) => Boolean(q.student && q.quiz)).length;

    return {
      data: {
        users,
        courses:      await strapi.db.query('api::course.course').count(),
        lessons:      await strapi.db.query('api::lesson.lesson').count(),
        enrollments:  validEnrollments,
        quizAttempts: validQuizAttempts,
        blogPosts: {
          published: await posts.count({ where: { publishState: 'published' } }),
          drafts:    await posts.count({ where: { publishState: 'draft' } }),
        },
      },
    };
  },

});
