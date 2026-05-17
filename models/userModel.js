const mongoose = require('mongoose');
mongoose.set('strictQuery', true); 

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true},
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now},
  isProfileComplete: {type: Boolean, default:false },
  resetPasswordToken:{type: String, default: ''},
  resetPasswordExpires: {type: String, default: ''}
});

const User = mongoose.model('User', userSchema);

module.exports = User;