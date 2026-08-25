import type { Core } from '@strapi/strapi';

// A role cannot be chosen at signup, so there would be no way to sign in as anything but a
// Student without these. The password is read from the environment: the repo is public, and
// without SEED_PASSWORD set nothing is created at all.
const accounts = [
  { username: 'admin', email: 'admin@demo.test', roleType: 'admin' },
  { username: 'manager', email: 'manager@demo.test', roleType: 'content_manager' },
  { username: 'instructor', email: 'instructor@demo.test', roleType: 'instructor' },
  { username: 'student', email: 'student@demo.test', roleType: 'student' },
  // A second student so the progress numbers on a shared course differ, which is the only way to
  // show that a percentage belongs to one student rather than to the course.
  { username: 'student2', email: 'student2@demo.test', roleType: 'student' },
];

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const password = process.env.SEED_PASSWORD;

  if (!password) return;

  for (const account of accounts) {
    const existing = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { email: account.email } });

    if (existing) continue;

    const role = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: account.roleType } });

    if (!role) {
      strapi.log.warn(`no ${account.roleType} role yet, skipping ${account.email}`);
      continue;
    }

    // The plugin's own add() runs the password through the document service, which hashes it.
    // Writing the user with strapi.db directly would store it in clear text.
    await strapi
      .plugin('users-permissions')
      .service('user')
      .add({
        username: account.username,
        email: account.email,
        password,
        provider: 'local',
        confirmed: true,
        role: role.id,
      });

    strapi.log.info(`seeded ${account.email}`);
  }
};
