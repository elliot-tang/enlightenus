const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  xp: { type: Number, required: true, default: 0 },
  dateCreated: { type: Date, default: Date.now, immutable: true, },
});

const User = mongoose.model('User', userSchema);
module.exports = User;