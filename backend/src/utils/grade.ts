// counts how many answers match the correct option index
// questions come from the DB (with correctIndex); answers is the array the student submitted
export const grade = (
  questions: { correctIndex?: number | null }[],
  answers:   unknown[],
) =>
  questions.reduce(
    (score, question, index) => score + (answers[index] === question.correctIndex ? 1 : 0),
    0
  );
