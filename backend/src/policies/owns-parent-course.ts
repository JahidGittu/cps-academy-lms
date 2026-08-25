import type { Core } from '@strapi/strapi';

// Lessons and quizzes belong to a course, and it is that course's owner who may add to them or
// change them. Shared by both routers rather than written twice, with the content type passed in
// as config because the row has to be read before its course can be followed.
type Config = { contentType: 'api::lesson.lesson' | 'api::quiz.quiz' };

type ParentContext = Core.PolicyContext & {
  state: { user?: { id: number; role?: { name?: string } } };
  params: { id?: string };
};

type ParentRow = { course?: { documentId?: string } } | null;

const MANAGES_THE_LIBRARY = ['Content Manager', 'Admin'];

export default async (
  policyContext: ParentContext,
  config: Config,
  { strapi }: { strapi: Core.Strapi }
) => {
  const user = policyContext.state.user;

  if (!user) return false;

  if (MANAGES_THE_LIBRARY.includes(user.role?.name ?? '')) return true;

  // On create the course arrives in the body; on update and delete it has to be read off the row
  // being changed, because the request only carries that row's id. An update can be both at once:
  // moving a lesson means owning the course it is leaving and the course it is arriving at, or an
  // instructor could push their own lesson into somebody else's syllabus.
  const body = policyContext.request.body as { data?: { course?: unknown } } | undefined;
  const courseIds = new Set<unknown>();

  if (policyContext.params.id) {
    const row = (await strapi.documents(config.contentType).findOne({
      documentId: policyContext.params.id,
      populate: ['course'],
    })) as ParentRow;

    courseIds.add(row?.course?.documentId);
  }

  if (body?.data?.course !== undefined) courseIds.add(body.data.course);

  if (!courseIds.size) return false;

  for (const courseId of courseIds) {
    if (typeof courseId !== 'string') return false;

    const course = await strapi.documents('api::course.course').findOne({
      documentId: courseId,
      populate: ['owner'],
    });

    if (course?.owner?.id !== user.id) return false;
  }

  return true;
};
