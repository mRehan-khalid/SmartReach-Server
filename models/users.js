// models/users.js

const mongoose = require('mongoose');
mongoose.set('strictQuery', true); 

// User schema define kar rahe hain
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true},
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now}
});

const User = mongoose.model('User', userSchema);

module.exports = User;