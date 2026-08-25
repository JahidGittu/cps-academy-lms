/**
 * quiz router
 */

import { factories } from '@strapi/strapi';

const ownsCourse = {
  name: 'global::owns-parent-course',
  config: { contentType: 'api::quiz.quiz' },
};

export default factories.createCoreRouter('api::quiz.quiz', {
  config: {
    create: { policies: [ownsCourse] },
    update: { policies: [ownsCourse] },
    delete: { policies: [ownsCourse] },
  },
});
