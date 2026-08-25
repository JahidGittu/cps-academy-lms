import type { Core } from '@strapi/strapi';

const READ = ['find', 'findOne'];
const MANAGE = ['find', 'findOne', 'create', 'update', 'delete'];

// The type is what Advanced Settings stores as the role for new signups, so it is
// written out here instead of letting Strapi derive it from the name. Exported because the
// stats endpoint counts accounts per role and should ask one place which roles exist, rather
// than reading them back out of the database and finding Strapi's own unused ones in there.
export const roles = [
  { name: 'Admin', type: 'admin', description: 'Full control of the platform.' },
  { name: 'Content Manager', type: 'content_manager', description: 'Builds the course library and writes the blog.' },
  { name: 'Instructor', type: 'instructor', description: 'Manages their own courses, lessons and quizzes.' },
  { name: 'Student', type: 'student', description: 'Enrolls in courses, reads lessons and takes quizzes.' },
];

// The permission matrix from the project spec. A role holding a box here may call that
// endpoint at all; narrowing a call to the caller's own rows is the controllers' job.
const matrix: Record<string, Record<string, string[]>> = {
  Public: {
    'api::blog-post.blog-post': READ,
  },

  Student: {
    // progress is the custom route in api/course/routes/progress.ts. Anyone who can see a course
    // can ask how far through it people are; which people is decided in the controller.
    'api::course.course': [...READ, 'progress'],
    'api::lesson.lesson': READ,
    'api::quiz.quiz': READ,
    'api::blog-post.blog-post': READ,
    'api::enrollment.enrollment': ['find', 'findOne', 'create', 'delete'],
    'api::lesson-progress.lesson-progress': ['find', 'findOne', 'create', 'delete'],
    'api::quiz-result.quiz-result': ['find', 'findOne', 'create'],
    'plugin::users-permissions.user': ['me'],
    'plugin::users-permissions.auth': ['logout'],
  },

  Instructor: {
    'api::course.course': [...MANAGE, 'progress'],
    'api::lesson.lesson': MANAGE,
    'api::quiz.quiz': MANAGE,
    'api::blog-post.blog-post': READ,
    'api::enrollment.enrollment': READ,
    'api::lesson-progress.lesson-progress': READ,
    'api::quiz-result.quiz-result': READ,
    'plugin::users-permissions.user': ['me'],
    'plugin::users-permissions.auth': ['logout'],
  },

  'Content Manager': {
    'api::course.course': [...MANAGE, 'progress'],
    'api::lesson.lesson': MANAGE,
    'api::quiz.quiz': MANAGE,
    'api::blog-post.blog-post': MANAGE,
    'api::enrollment.enrollment': READ,
    'api::lesson-progress.lesson-progress': READ,
    'api::quiz-result.quiz-result': READ,
    'plugin::users-permissions.user': ['me'],
    'plugin::users-permissions.auth': ['logout'],
  },

  // No create on enrollment or quiz-result: the matrix marks "enroll in a course" and
  // "take quizzes" as things an Admin does not do. The deletes are platform management.
  Admin: {
    'api::course.course': [...MANAGE, 'progress'],
    'api::lesson.lesson': MANAGE,
    'api::quiz.quiz': MANAGE,
    'api::blog-post.blog-post': MANAGE,
    'api::enrollment.enrollment': ['find', 'findOne', 'delete'],
    'api::lesson-progress.lesson-progress': ['find', 'findOne', 'delete'],
    'api::quiz-result.quiz-result': ['find', 'findOne', 'delete'],
    'plugin::users-permissions.user': ['me', 'find', 'findOne', 'count', 'create', 'update', 'destroy'],
    'plugin::users-permissions.role': READ,
    'plugin::users-permissions.auth': ['logout'],
    // Nobody else gets this box, so the stats controller has no role check of its own.
    'api::stats.stats': ['find'],
  },
};

// Which permissions this file may remove. Nothing under plugin::users-permissions.auth is ever
// removed: those are the boxes that let anyone register and log in, and rewriting them from here
// could lock the platform shut. Granting auth.logout above still works, because the plugin hands
// it out by role type and none of these four roles is of type authenticated.
const isMine = (action: string) =>
  action.startsWith('api::') ||
  action.startsWith('plugin::users-permissions.user.') ||
  action.startsWith('plugin::users-permissions.role.');

const ensureRoles = async (strapi: Core.Strapi) => {
  for (const role of roles) {
    const existing = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: role.type } });

    if (!existing) {
      await strapi.db.query('plugin::users-permissions.role').create({ data: role });
      strapi.log.info(`created role ${role.name}`);
    }
  }
};

const applyMatrix = async (strapi: Core.Strapi) => {
  for (const [roleName, endpoints] of Object.entries(matrix)) {
    const role = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { name: roleName } });

    if (!role) {
      strapi.log.warn(`role ${roleName} is in the matrix but not in the database`);
      continue;
    }

    const wanted = new Set(
      Object.entries(endpoints).flatMap(([uid, actions]) => actions.map((action) => `${uid}.${action}`))
    );

    const current = await strapi.db
      .query('plugin::users-permissions.permission')
      .findMany({ where: { role: { id: role.id } } });

    for (const permission of current) {
      if (isMine(permission.action) && !wanted.has(permission.action)) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .delete({ where: { id: permission.id } });
      }
    }

    const already = new Set(current.map((permission) => permission.action));

    for (const action of wanted) {
      if (!already.has(action)) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: role.id } });
      }
    }
  }
};

type AdvancedSettings = { default_role: string };

const setSignupRole = async (strapi: Core.Strapi, type: string) => {
  const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const advanced = (await store.get({ key: 'advanced' })) as AdvancedSettings | null;

  if (!advanced || advanced.default_role === type) return;

  await store.set({ key: 'advanced', value: { ...advanced, default_role: type } });
  strapi.log.info(`default signup role set to ${type}`);
};

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  await ensureRoles(strapi);
  await applyMatrix(strapi);
  await setSignupRole(strapi, 'student');
};
