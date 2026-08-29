import type { Core } from '@strapi/strapi';

const READ = ['find', 'findOne'];
const MANAGE = ['find', 'findOne', 'create', 'update', 'delete'];

export const roles = [
  { name: 'Admin', type: 'admin', description: 'Full control of the platform.' },
  { name: 'Content Manager', type: 'content_manager', description: 'Builds the course library and writes the blog.' },
  { name: 'Instructor', type: 'instructor', description: 'Manages their own courses, lessons and quizzes.' },
  { name: 'Student', type: 'student', description: 'Enrolls in courses, reads lessons and takes quizzes.' },
];

// RBAC Permission matrix mapping
const matrix: Record<string, Record<string, string[]>> = {
  Public: {
    'api::course.course': READ,
    'api::blog-post.blog-post': READ,
  },

  Student: {
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
    'api::quiz.quiz': [...MANAGE, 'answers'],
    'api::blog-post.blog-post': READ,
    'api::enrollment.enrollment': READ,
    'api::lesson-progress.lesson-progress': READ,
    'api::quiz-result.quiz-result': READ,
    'plugin::upload.content-api': ['upload', 'destroy', 'find', 'findOne'],
    'plugin::users-permissions.user': ['me'],
    'plugin::users-permissions.auth': ['logout'],
  },

  'Content Manager': {
    'api::course.course': [...MANAGE, 'progress'],
    'api::lesson.lesson': MANAGE,
    'api::quiz.quiz': [...MANAGE, 'answers'],
    'api::blog-post.blog-post': MANAGE,
    'api::enrollment.enrollment': READ,
    'api::lesson-progress.lesson-progress': READ,
    'api::quiz-result.quiz-result': READ,
    'plugin::upload.content-api': ['upload', 'destroy', 'find', 'findOne'],
    'plugin::users-permissions.user': ['me'],
    'plugin::users-permissions.auth': ['logout'],
  },

  Admin: {
    'api::course.course': [...MANAGE, 'progress'],
    'api::lesson.lesson': MANAGE,
    'api::quiz.quiz': [...MANAGE, 'answers'],
    'api::blog-post.blog-post': MANAGE,
    'api::enrollment.enrollment': ['find', 'findOne', 'delete'],
    'api::lesson-progress.lesson-progress': ['find', 'findOne', 'delete'],
    'api::quiz-result.quiz-result': ['find', 'findOne', 'delete'],
    'plugin::upload.content-api': ['upload', 'destroy', 'find', 'findOne'],
    'plugin::users-permissions.user': ['me', 'find', 'findOne', 'count', 'create', 'update', 'destroy'],
    'plugin::users-permissions.role': READ,
    'plugin::users-permissions.auth': ['logout'],
    'api::stats.stats': ['find'],
  },
};

const isMine = (action: string) =>
  action.startsWith('api::') ||
  action.startsWith('plugin::users-permissions.user.') ||
  action.startsWith('plugin::users-permissions.role.') ||
  action.startsWith('plugin::upload.');

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
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type } });

  if (!role) return;

  const current = (await store.get({ key: 'advanced' })) as AdvancedSettings | null;

  if (current && String(current.default_role) !== String(role.id)) {
    await store.set({ key: 'advanced', value: { ...current, default_role: role.id } });
  }
};

export const applyPermissions = async (strapi: Core.Strapi) => {
  await ensureRoles(strapi);
  await applyMatrix(strapi);
  await setSignupRole(strapi, 'student');
};

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  await applyPermissions(strapi);
};

