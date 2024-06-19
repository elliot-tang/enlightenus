const mongoose = require("mongoose");
const Quiz = require('./quiz');
const { MCQ, OEQ } = require('./question');

const userTakenQuestionSchema = new mongoose.Schema({
  question: {
    questionId: { type: mongoose.Schema.Types.ObjectId, refPath: 'question.questionType', required: true },
    questionType: { type: String, required: true, enum: ['MCQ', 'OEQ'], },
  },
  response: { type: String, required: true, },
  isCorrect: { type: Boolean, required: true, default: false },
})

// TODO: checking for valid score to be done in routes/client-side
const userTakenQuizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true, },
  breakdown: [userTakenQuestionSchema],
  dateTaken: { type: Date, default: Date.now, immutable: true, },
});

const UserTakenQuiz = mongoose.model('UserTakenQuiz', userTakenQuizSchema);
module.exports = UserTakenQuiz;