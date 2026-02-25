const mongoose = require('mongoose');

// Strict query mode
mongoose.set('strictQuery', true);

const pendingUsersSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  password: { type: String, required: true }, // Already hashed before storing
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }, // TTL field
  createdAt: { type: Date, default: Date.now }
});

// TTL index: MongoDB will automatically delete document after expiresAt
pendingUsersSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingUsers = mongoose.model('PendingUsers', pendingUsersSchema);

module.exports = PendingUsers;