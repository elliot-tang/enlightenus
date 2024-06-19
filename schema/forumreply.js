const mongoose = require("mongoose");

const forumReplySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', required: true },
  replyBody: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v) {
        return v.trim() != "";
      }, 
      message: 'Please do not input an empty forum reply!',
    }
  },
  date: { type: Date, default: Date.now, immutable: true },
});

const ForumReply = mongoose.model('ForumReply', forumReplySchema);
module.exports = ForumReply;