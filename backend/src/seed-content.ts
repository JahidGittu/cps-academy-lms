import type { Core } from '@strapi/strapi';

import { demoCourses, demoEnrollments, demoPosts } from './demo-content';
import { grade } from './utils/grade';

// Without this a fresh deployment has four accounts and nothing to look at. It runs on every boot
// and skips anything already there, so it fills an empty database and leaves a used one alone.
// Editing a seeded course through the app is safe: the title is what this checks, so the row is
// recognised rather than written over.

const userId = async (strapi: Core.Strapi, email: string) => {
  const user = await strapi.db
    .query('plugin::users-permissions.user')
    .findOne({ where: { email } });

  return user?.id as number | undefined;
};

const findByTitle = async (strapi: Core.Strapi, uid: 'api::course.course' | 'api::blog-post.blog-post', title: string) => {
  const [row] = await strapi.documents(uid).findMany({ filters: { title }, limit: 1 });

  return row;
};

const seedCourses = async (strapi: Core.Strapi) => {
  for (const demo of demoCourses) {
    if (await findByTitle(strapi, 'api::course.course', demo.title)) continue;

    const owner = await userId(strapi, demo.ownerEmail);

    if (!owner) {
      strapi.log.warn(`no account for ${demo.ownerEmail}, skipping course ${demo.title}`);
      continue;
    }

    const course = await strapi.documents('api::course.course').create({
      data: { title: demo.title, description: demo.description, owner },
    });

    for (const lesson of demo.lessons) {
      await strapi.documents('api::lesson.lesson').create({
        data: { ...lesson, course: course.documentId },
      });
    }

    if (demo.quiz) {
      await strapi.documents('api::quiz.quiz').create({
        data: { ...demo.quiz, course: course.documentId },
      });
    }

    strapi.log.info(`seeded course ${demo.title}`);
  }
};

const seedPosts = async (strapi: Core.Strapi) => {
  const author = await userId(strapi, 'manager@demo.test');

  if (!author) return;

  for (const post of demoPosts) {
    if (await findByTitle(strapi, 'api::blog-post.blog-post', post.title)) continue;

    await strapi.documents('api::blog-post.blog-post').create({ data: { ...post, author } });
  }
};

// Enrollments come with part of the course already finished, and the quiz answers are graded here
// rather than stored alongside a score, so the demo percentages are produced the same way a real
// student's would be.
const seedEnrollments = async (strapi: Core.Strapi) => {
  for (const demo of demoEnrollments) {
    const student = await userId(strapi, demo.studentEmail);
    const course = await findByTitle(strapi, 'api::course.course', demo.courseTitle);

    if (!student || !course) continue;

    const [already] = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: { student: { id: student }, course: { documentId: course.documentId } },
      limit: 1,
    });

    if (already) continue;

    await strapi.documents('api::enrollment.enrollment').create({
      data: { student, course: course.documentId },
    });

    const lessons = await strapi.documents('api::lesson.lesson').findMany({
      filters: { course: { documentId: course.documentId } },
      sort: 'order:asc',
    });

    for (const lesson of lessons.slice(0, demo.lessonsDone)) {
      await strapi.documents('api::lesson-progress.lesson-progress').create({
        data: { student, lesson: lesson.documentId },
      });
    }

    if (!demo.quizAnswers) continue;

    const [quiz] = await strapi.documents('api::quiz.quiz').findMany({
      filters: { course: { documentId: course.documentId } },
      populate: { questions: true },
      limit: 1,
    });

    if (!quiz) continue;

    const questions = quiz.questions ?? [];

    await strapi.documents('api::quiz-result.quiz-result').create({
      data: {
        student,
        quiz: quiz.documentId,
        answers: demo.quizAnswers,
        score: grade(questions, demo.quizAnswers),
        total: questions.length,
      },
    });
  }
};

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // Content is owned by a demo account, so with SEED_PASSWORD unset there is nothing to attach it
  // to and no reason to write any of it.
  if (!(await userId(strapi, 'instructor@demo.test'))) return;

  await seedCourses(strapi);
  await seedPosts(strapi);
  await seedEnrollments(strapi);
};
