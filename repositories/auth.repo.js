const User = require('../models/users');

const createUser = async (data) => {
  return await User.create(data);
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

module.exports = {
  createUser,
  findUserByEmail
};
