/**
 * course router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::course.course', {
  config: {
    update: { policies: ['global::is-course-owner'] },
    delete: { policies: ['global::is-course-owner'] },
  },
});
