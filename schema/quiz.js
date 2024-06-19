const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  questions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, refPath: 'questions.questionType', required: true },
    questionType: { type: String, required: true, enum: ['MCQ', 'OEQ'], },
    questionAttempts: { type: Number, required: true, default: 1, },
  }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  rating: { type: Number, required: true, default: 0 },
  timesRated: { type: Number, required: true, default: 0 },
  timesTaken: { type: Number, required: true, default: 0 },
  isVerified: { type: Boolean, required: true, default: false },
  dateCreated: { type: Date, default: Date.now, immutable: true, },
});

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = Quiz;