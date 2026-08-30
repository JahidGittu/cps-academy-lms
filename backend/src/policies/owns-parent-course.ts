import type { Core } from '@strapi/strapi';


// Lessons and quizzes belong to a course — whoever owns that course may add to or change them.
// Shared by both lesson and quiz routers via config, so the content type is passed in rather than hard-coded.
type Config = { contentType: 'api::lesson.lesson' | 'api::quiz.quiz' };

type ParentContext = Core.PolicyContext & {
  state:  { user?: { id: number; role?: { name?: string } } };
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

  // admins and content managers pass without any further check
  if (MANAGES_THE_LIBRARY.includes(user.role?.name ?? '')) return true;

  // collect every course id this operation touches:
  //  - on create: the course comes in the request body
  //  - on update/delete: look it up from the existing row
  //  - on move: both the source and destination course must be owned by this instructor
  const body = policyContext.request.body as { data?: { course?: unknown } } | undefined;
  const courseIds = new Set<unknown>();

  if (policyContext.params.id) {
    const row = (await strapi.documents(config.contentType).findOne({
      documentId: policyContext.params.id,
      populate:   ['course'],
    })) as ParentRow;

    courseIds.add(row?.course?.documentId);
  }

  if (body?.data?.course !== undefined) courseIds.add(body.data.course);

  if (!courseIds.size) return false;

  // every involved course must belong to the caller
  for (const courseId of courseIds) {
    if (typeof courseId !== 'string') return false;

    const course = await strapi.documents('api::course.course').findOne({
      documentId: courseId,
      populate:   ['owner'],
    });

    if (course?.owner?.id !== user.id) return false;
  }

  return true;
};
