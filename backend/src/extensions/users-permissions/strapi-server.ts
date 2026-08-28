import type { Context } from 'koa';

type UsersPermissionsPlugin = {
  controllers: {
    user: {
      me: (ctx: Context) => Promise<void>;
      destroy: (ctx: Context) => Promise<void>;
    };
  };
};

export default (plugin: UsersPermissionsPlugin) => {
  const { me, destroy } = plugin.controllers.user;

  // The output sanitizer removes every relation the caller is not allowed to read, and reading
  // the role collection is an Admin-only permission, so /users/me answered without a role for
  // the three roles that need it most. The role the request was already authenticated with is
  // put back here rather than by widening that permission.
  plugin.controllers.user.me = async (ctx: Context) => {
    await me(ctx);

    // ctx.body is typed as unknown, so the shape being added to is stated here.
    const user = ctx.body as { role?: unknown } | null;
    const role = ctx.state.user?.role;

    if (user && role) {
      user.role = { id: role.id, name: role.name, type: role.type };
    }
  };

  // Cascade delete all student-related data when an account is deleted
  plugin.controllers.user.destroy = async (ctx: Context) => {
    const targetUserId = Number(ctx.params.id);

    if (targetUserId) {
      try {
        // 1. Delete user enrollments
        const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({
          filters: { student: { id: targetUserId } },
        });
        for (const e of enrollments) {
          await strapi.documents('api::enrollment.enrollment').delete({ documentId: e.documentId });
        }

        // 2. Delete user lesson progresses
        const progresses = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
          filters: { student: { id: targetUserId } },
        });
        for (const lp of progresses) {
          await strapi.documents('api::lesson-progress.lesson-progress').delete({ documentId: lp.documentId });
        }

        // 3. Delete user quiz results
        const quizResults = await strapi.documents('api::quiz-result.quiz-result').findMany({
          filters: { student: { id: targetUserId } },
        });
        for (const qr of quizResults) {
          await strapi.documents('api::quiz-result.quiz-result').delete({ documentId: qr.documentId });
        }
      } catch (err) {
        strapi.log.error('Error during cascade user deletion:', err);
      }
    }

    await destroy(ctx);
  };

  return plugin;
};
