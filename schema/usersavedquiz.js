const mongoose = require("mongoose");
const User = require("./user");
const { MCQ, OEQ } = require("./question");

const userSavedQuizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  dateSaved: { type: Date, default: Date.now, immutable: true, },
});

const userSavedQuestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: {
    questionId: { type: mongoose.Schema.Types.ObjectId, refPath: 'question.questionType', required: true },
    questionType: { type: String, required: true, enum: ['MCQ', 'OEQ'], },
  },
  dateSaved: { type: Date, default: Date.now, immutable: true, },
});

const UserSavedQuestion = mongoose.model('UserSavedQuestion', userSavedQuestionSchema);
const UserSavedQuiz = mongoose.model('UserSavedQuiz', userSavedQuizSchema);
module.exports = { UserSavedQuestion, UserSavedQuiz };