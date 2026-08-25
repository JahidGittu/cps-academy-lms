/**
 * course progress route
 */

// A second file rather than a line in course.ts, because createCoreRouter only generates the five
// CRUD routes and has nowhere to put a sixth. Strapi loads every file in routes/, and this path
// does not collide with /courses/:id since the segment count differs.
export default {
  routes: [
    {
      method: 'GET',
      path: '/courses/:id/progress',
      handler: 'course.progress',
    },
  ],
};
