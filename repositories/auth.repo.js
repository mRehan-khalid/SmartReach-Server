const User = require('../models/users');

const createUser = async (data) => {
  return await User.create(data);
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// ✅ New function: check both email and username
const findUserByEmailOrUsername = async (email, username) => {
  return await User.findOne({
    $or: [{ email }, { username }]
  });
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByEmailOrUsername // <-- ab controller me use ho sakta
};