import type { Core } from '@strapi/strapi';

// Roles can say "Instructors may edit courses". They cannot say "their own courses", which is the
// line the permission matrix actually draws, so it is drawn here instead.
type OwnerContext = Core.PolicyContext & {
  state: { user?: { id: number; role?: { name?: string } } };
  params: { id: string };
};

const MANAGES_THE_LIBRARY = ['Content Manager', 'Admin'];

export default async (
  policyContext: OwnerContext,
  config: unknown,
  { strapi }: { strapi: Core.Strapi }
) => {
  const user = policyContext.state.user;

  if (!user) return false;

  if (MANAGES_THE_LIBRARY.includes(user.role?.name ?? '')) return true;

  const course = await strapi.documents('api::course.course').findOne({
    documentId: policyContext.params.id,
    populate: ['owner'],
  });

  // A course that does not exist fails the same way a course belonging to someone else does.
  // Every branch returns an explicit boolean: Strapi reads a missing return as no opinion and
  // lets the request through.
  return course?.owner?.id === user.id;
};
