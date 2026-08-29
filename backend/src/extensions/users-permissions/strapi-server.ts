import type { Context } from 'koa';

// Declare global Strapi instance available in runtime
declare const strapi: any;

export default (plugin: any) => {
  const { me, destroy } = plugin.controllers.user;

  // The output sanitizer removes every relation the caller is not allowed to read, and reading
  // the role collection is an Admin-only permission, so /users/me answered without a role for
  // the three roles that need it most. The role the request was already authenticated with is
  // put back here rather than by widening that permission.
  plugin.controllers.user.me = async (ctx: Context & { state: { user?: { role?: { id: number; name: string; type: string } } } }) => {
    await me(ctx);

    // ctx.body is typed as unknown, so the shape being added to is stated here.
    const user = ctx.body as { role?: unknown } | null;
    const role = ctx.state.user?.role;

    if (user && role) {
      user.role = { id: role.id, name: role.name, type: role.type };
    }
  };

  // Dedicated controller for authenticated user to update their own profile username safely
  plugin.controllers.user.updateMe = async (ctx: any) => {
    const authUser = ctx.state?.user;
    if (!authUser) {
      return ctx.unauthorized();
    }

    const { username } = (ctx.request?.body as { username?: string }) || {};

    if (!username || !username.trim()) {
      return ctx.badRequest('Username cannot be empty.');
    }

    const cleanUsername = username.trim();

    // Check if username is already taken by another user
    const existing = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: {
        username: cleanUsername,
        id: { $ne: authUser.id },
      },
    });

    if (existing) {
      return ctx.badRequest('Username is already taken. Please choose another username.');
    }

    const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: authUser.id },
      data: { username: cleanUsername },
    });

    return ctx.send({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: authUser.role ? { id: authUser.role.id, name: authUser.role.name } : undefined,
    });
  };

  // Register PUT /users/me endpoint in users-permissions router
  if (plugin.routes?.['content-api']?.routes) {
    plugin.routes['content-api'].routes.push({
      method: 'PUT',
      path: '/users/me',
      handler: 'user.updateMe',
      config: {
        prefix: '',
        policies: [],
      },
    });
  }

  // Cascade delete all student-related data when an account is deleted
  plugin.controllers.user.destroy = async (ctx: any) => {
    const targetUserId = Number(ctx.params?.id);

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
