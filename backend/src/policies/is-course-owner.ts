import type { Core } from '@strapi/strapi';


// Strapi permissions can say "Instructors may edit courses" but cannot limit that to their own.
// This policy enforces the "own courses only" half of the rule for any route that touches a course directly.
type OwnerContext = Core.PolicyContext & {
  state:  { user?: { id: number; role?: { name?: string } } };
  params: { id: string };
};

// these roles see the whole library and pass without an ownership check
const MANAGES_THE_LIBRARY = ['Content Manager', 'Admin'];


export default async (
  policyContext: OwnerContext,
  config: unknown,
  { strapi }: { strapi: Core.Strapi }
) => {
  const user = policyContext.state.user;
  if (!user) return false;

  // admins and content managers skip the ownership check
  if (MANAGES_THE_LIBRARY.includes(user.role?.name ?? '')) return true;

  const course = await strapi.documents('api::course.course').findOne({
    documentId: policyContext.params.id,
    populate:   ['owner'],
  });

  // a missing course fails the same way as someone else's course — no 404 hint
  return course?.owner?.id === user.id;
};
