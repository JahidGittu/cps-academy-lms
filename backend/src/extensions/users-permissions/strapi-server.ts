// @ts-nocheck

export default (plugin: any) => {
  const { me, destroy } = plugin.controllers.user;


  // override register so every public signup lands in the Student role
  plugin.controllers.auth.register = async (ctx: any) => {
    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });
    const settings    = await pluginStore.get({ key: 'advanced' });

    if (settings && settings.allow_register === false) {
      return ctx.badRequest('Register action is currently disabled');
    }

    const { email, username, password } = ctx.request?.body || {};

    if (!email    || !email.trim())      return ctx.badRequest('Email is required');
    if (!username || !username.trim())   return ctx.badRequest('Username is required');
    if (!password || password.length < 6) return ctx.badRequest('Password must be at least 6 characters');

    const cleanEmail    = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // uniqueness checks
    const takenUsername = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { username: cleanUsername } });
    if (takenUsername) return ctx.badRequest('Username or Name is already taken. Please choose another.');

    const takenEmail = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { email: cleanEmail } });
    if (takenEmail) return ctx.badRequest('An account with this email address already exists.');

    // find the Student role — fall back to type=authenticated if it doesn't exist yet
    let studentRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'student' } });

    if (!studentRole) {
      studentRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { name: 'Student' } });
    }

    if (!studentRole) {
      studentRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });
    }

    if (!studentRole) return ctx.badRequest('Student role is not configured in database.');

    // create the user via the plugin service so the password is hashed properly
    const newUser = await strapi.plugin('users-permissions').service('user').add({
      username:  cleanUsername,
      email:     cleanEmail,
      password,
      provider:  'local',
      confirmed: true,
      role:      studentRole.id,
    });

    // issue a JWT immediately so the client doesn't need a separate login step
    const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: newUser.id });

    return ctx.send({
      jwt,
      user: {
        id:        newUser.id,
        username:  newUser.username,
        email:     newUser.email,
        confirmed: newUser.confirmed,
        blocked:   newUser.blocked,
        role: {
          id:   studentRole.id,
          name: studentRole.name,
          type: studentRole.type,
        },
      },
    });
  };


  // /users/me normally strips the role relation (admin-only permission) — put it back manually
  plugin.controllers.user.me = async (ctx: any) => {
    await me(ctx);

    const user = ctx.body as { role?: unknown } | null;
    const role = ctx.state?.user?.role;

    if (user && role) {
      user.role = { id: role.id, name: role.name, type: role.type };
    }
  };


  // lets an authenticated user rename themselves without touching any other field
  plugin.controllers.user.updateMe = async (ctx: any) => {
    const authUser = ctx.state?.user;
    if (!authUser) return ctx.unauthorized();

    const { username } = (ctx.request?.body as { username?: string }) || {};
    if (!username || !username.trim()) return ctx.badRequest('Username cannot be empty.');

    const cleanUsername = username.trim();

    // make sure the new name isn't taken by someone else
    const existing = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { username: cleanUsername, id: { $ne: authUser.id } },
    });

    if (existing) return ctx.badRequest('Username is already taken. Please choose another username.');

    const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: authUser.id },
      data:  { username: cleanUsername },
    });

    return ctx.send({
      id:       updatedUser.id,
      username: updatedUser.username,
      email:    updatedUser.email,
      role:     authUser.role ? { id: authUser.role.id, name: authUser.role.name } : undefined,
    });
  };


  // expose PUT /users/me in the content-api router
  if (plugin.routes?.['content-api']?.routes) {
    plugin.routes['content-api'].routes.push({
      method:  'PUT',
      path:    '/users/me',
      handler: 'user.updateMe',
      config:  { prefix: '', policies: [] },
    });
  }


  // cascade delete all student data when their account is removed
  plugin.controllers.user.destroy = async (ctx: any) => {
    const targetUserId = Number(ctx.params?.id);

    if (targetUserId) {
      try {
        // enrollments
        const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({
          filters: { student: { id: targetUserId } },
        });
        for (const e of enrollments) {
          await strapi.documents('api::enrollment.enrollment').delete({ documentId: e.documentId });
        }

        // lesson progress records
        const progresses = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
          filters: { student: { id: targetUserId } },
        });
        for (const lp of progresses) {
          await strapi.documents('api::lesson-progress.lesson-progress').delete({ documentId: lp.documentId });
        }

        // quiz results
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
