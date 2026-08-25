import { errors } from '@strapi/utils';
import type { Context } from 'koa';

// The two roles the permission matrix lets read every student's rows. Instructor is narrowed to
// its own courses and Student to its own rows, so both of those need a filter added to the query
// before it reaches the database.
const SEES_EVERY_ROW = ['Content Manager', 'Admin'];

type Caller = { id: number; role?: { name?: string } };

export const caller = (ctx: Context) => {
  const user = ctx.state.user as Caller | undefined;

  // Every route these helpers are used on sits behind a role permission, so an anonymous request
  // cannot reach them. Throwing beats returning undefined and having each caller re-check.
  if (!user) throw new errors.UnauthorizedError();

  return user;
};

export const roleName = (ctx: Context) => caller(ctx).role?.name ?? '';

export const seesEveryRow = (ctx: Context) => SEES_EVERY_ROW.includes(roleName(ctx));

// Narrows an already sanitized query so it can only return the caller's own rows. It has to run
// after sanitizeQuery, not before: validateQuery rejects a filter on any relation the caller may
// not read, and the user relation these filters point at is exactly that. Merged with $and rather
// than spread in, so a filter the client sent cannot collide with the key and replace it.
export const narrow = (query: Record<string, unknown>, mine: Record<string, unknown>) => {
  query.filters = query.filters ? { $and: [query.filters, mine] } : mine;
};
