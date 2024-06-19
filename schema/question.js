const mongoose = require("mongoose");

// As of now, allows for multiple correct answers
const AnswerSchema = new mongoose.Schema({
  answer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true, default: false },
});

const MCQSchema = new mongoose.Schema({
  questionBody: { type: String, required: true },
  options: {
    type: [AnswerSchema],
    required: true, 
    validate: [
      // checks for at least one answer option
      {
        validator: function(v) {
          return v && v.length > 0;
        }, 
        message: 'You must have at least one answer option!',
      },
      
      // checks for duplicate elements:
      // checks if length of set of elements = original length
      {
        validator: function(v) {
          const answers = v.map(option => option.answer);
          return answers.length === new Set(answers).size;
        },
        message: 'Each answer option must be unique!',
      },
      
      // checks that at least one correct answer exists
      {
        validator: function(v) {
          return v.some(option => option.isCorrect == true);
        },
        message: 'There must be at least one correct answer!',
      },
    ]
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  explainText: { type: String, },
});

// Allows for multiple correct answers
const OEQSchema = new mongoose.Schema({
  questionBody: { type: String, required: true, },
  correctOptions: {
    type: [String], 
    required: true, 
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'You must have at least one correct answer option!',
    }
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  explainText: { type: String, },
})

const MCQ = mongoose.model('MCQ', MCQSchema);
const OEQ = mongoose.model('OEQ', OEQSchema);

module.exports = { MCQ, OEQ };