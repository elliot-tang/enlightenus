const mongoose = require("mongoose");

const reportedPostSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportReason: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v) {
        return v.trim() != "";
      }, 
      message: 'Please provide a reason for reporting!',
    }
  },
  date: { type: Date, default: Date.now, immutable: true },
});

const ReportedPost = mongoose.model('ReportedPost', reportedPostSchema);

const reportedReplySchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', required: true },
  replyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumReply', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportReason: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v) {
        return v.trim() != "";
      }, 
      message: 'Please provide a reason for reporting!',
    }
  },
  date: { type: Date, default: Date.now, immutable: true },
});

const ReportedReply = mongoose.model('ReportedReply', reportedReplySchema);

const reportedQuestionSchema = new mongoose.Schema({
  question: {
    questionId: { type: mongoose.Schema.Types.ObjectId, refPath: 'question.questionType', required: true },
    questionType: { type: String, required: true, enum: ['MCQ', 'OEQ'], },
  },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportReason: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v) {
        return v.trim() != "";
      }, 
      message: 'Please provide a reason for reporting!',
    }
  },
  date: { type: Date, default: Date.now, immutable: true },
});

const ReportedQuestion = mongoose.model('ReportedQuestion', reportedQuestionSchema);
module.exports = { ReportedPost, ReportedReply, ReportedQuestion };