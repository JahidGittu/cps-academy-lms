// answers[i] is the option index the student picked for question i. A missing or out of range pick
// counts as wrong rather than failing the whole submission, because a student who skips the last
// question has still taken the quiz.
//
// Shared so the score a seeded result carries is produced by the same rule as a live submission,
// rather than being a number written down next to the answers by hand.
//
// correctIndex is nullable because that is how Strapi types a component field coming back out of
// the database, and a question missing its answer marks every pick wrong rather than throwing.
export const grade = (questions: { correctIndex?: number | null }[], answers: unknown[]) =>
  questions.reduce(
    (correct, question, index) => correct + (answers[index] === question.correctIndex ? 1 : 0),
    0
  );
