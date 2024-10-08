const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postTitle: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v) {
        return v.trim() != "";
      }, 
      message: 'Please do not input an empty forum post title!',
    }
  },
  postTopic: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v) {
        return v.trim() != "";
      }, 
      message: 'Please do not input an empty forum post topic!',
    }
  },
  postBody: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v) {
        return v.trim() != "";
      }, 
      message: 'Please do not input an empty forum post!',
    }
  },
  attachments: [{
    attachmentId: { type: mongoose.Schema.Types.ObjectId, refPath: 'attachments.attachmentType', required: true },
    attachmentType: { type: String, required: true, enum: ['MCQ', 'OEQ', 'Quiz'], },
    attachmentName: { type: String, required: true, },
  }],
  isVerified: { type: Boolean, required: true, default: false },
  date: { type: Date, default: Date.now, immutable: true },
});

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
module.exports = ForumPost;