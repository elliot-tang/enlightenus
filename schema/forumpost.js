const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  date: { type: Date, default: Date.now, immutable: true },
});

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
module.exports = ForumPost;