export const grade = (questions: { correctIndex?: number | null }[], answers: unknown[]) =>
  questions.reduce(
    (correct, question, index) => correct + (answers[index] === question.correctIndex ? 1 : 0),
    0
  );
