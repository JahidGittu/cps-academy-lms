import { errors } from '@strapi/utils';
import type { Context } from 'koa';


// roles that can read any row, regardless of ownership
const SEES_EVERY_ROW = ['Content Manager', 'Admin'];

type Caller = { id: number; role?: { name?: string } };


// pulls the authenticated user out of Koa context — throws if the request is anonymous
export const caller = (ctx: Context) => {
  const user = ctx.state.user as Caller | undefined;
  if (!user) throw new errors.UnauthorizedError();
  return user;
};


// returns role name or empty string for public/anonymous requests
export const roleName = (ctx: Context) =>
  (ctx.state.user as Caller | undefined)?.role?.name ?? '';


// true for Admin and Content Manager — they see all rows without any ownership filter
export const seesEveryRow = (ctx: Context) => SEES_EVERY_ROW.includes(roleName(ctx));


// merges a scope filter into an already-sanitized query using $and, so the client's own
// filters can't collide with the ownership key and silently replace it
export const narrow = (query: Record<string, unknown>, mine: Record<string, unknown>) => {
  query.filters = query.filters ? { $and: [query.filters, mine] } : mine;
};


// lessons and quizzes live inside courses — students see those in their enrolled courses,
// instructors see those in courses they own
export const courseScope = (ctx: Context) => {
  const me = caller(ctx).id;

  return roleName(ctx) === 'Student'
    ? { course: { enrollments: { student: { id: me } } } }
    : { course: { owner: { id: me } } };
};
