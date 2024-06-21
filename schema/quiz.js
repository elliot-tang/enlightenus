const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  questions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, refPath: 'questions.questionType', required: true },
    questionType: { type: String, required: true, enum: ['MCQ', 'OEQ'], },
    questionAttempts: { type: Number, required: true, default: 1, },
    noOptions: { type: Number, required: true, },
  }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  rating: { type: Number, required: true, default: 0 },
  timesRated: { type: Number, required: true, default: 0 },
  timesTaken: { type: Number, required: true, default: 0 },
  isVerified: { type: Boolean, required: true, default: false },
  dateCreated: { type: Date, default: Date.now, immutable: true, },
});

// Ensures questions have unique questionIds
QuizSchema.path('questions').validate(function (questions) {
  const questionIds = questions.map(q => q.questionId.toString());
  const uniqueQuestionIds = new Set(questionIds);
  return questionIds.length === uniqueQuestionIds.size;
}, 'Quiz cannot contain the same question multiple times.');

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = Quiz;