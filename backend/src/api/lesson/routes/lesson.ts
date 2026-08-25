/**
 * lesson router
 */

import { factories } from '@strapi/strapi';

const ownsCourse = {
  name: 'global::owns-parent-course',
  config: { contentType: 'api::lesson.lesson' },
};

export default factories.createCoreRouter('api::lesson.lesson', {
  config: {
    create: { policies: [ownsCourse] },
    update: { policies: [ownsCourse] },
    delete: { policies: [ownsCourse] },
  },
});
