// Type definitions for component props etc.

export type TakenQuestionProps = {
  question: { questionId: string, questionType: string, },
  noAttempts: number,
  responses: Array<string>,
  isCorrect: boolean
}

export type TakenQuizProps = {
  username: string,
  quizId: string,
  score: number,
  breakdown: Array<TakenQuestionProps>
}
