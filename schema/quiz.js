const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  questions: { type: Array, required: true},
  title: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
});

const Quiz = mongoose.model('Quiz', userSchema);
module.exports = Quiz;