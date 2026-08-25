/**
 * quiz answer key route
 */

// Sits beside the generated CRUD routes for the same reason the course progress route does: a core
// router has nowhere to put a sixth route. The policy is the one the quiz writes already use, so
// reading the key needs exactly what changing it needs.
export default {
  routes: [
    {
      method: 'GET',
      path: '/quizzes/:id/answers',
      handler: 'quiz.answers',
      config: {
        policies: [
          { name: 'global::owns-parent-course', config: { contentType: 'api::quiz.quiz' } },
        ],
      },
    },
  ],
};
