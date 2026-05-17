const User = require('../models/userModel');
const PendingUsers = require('../models/pendingUserModel');

// OTP generator

class authRepository {

  async findUserByEmailOrUsername(email, username) {
    return await User.findOne({
      $or: [{ email }, { username }]
    });
  }

  async findPendingUser(query) {
    return await PendingUsers.findOne(query);
  }

  async updatePendingUser(pendingUser) {
    return await pendingUser.save();
  }

  async createPendingUser(query) {
    return await PendingUsers.create(query);
  }

  async deletePendingUser(query) {
    return await PendingUsers.deleteOne(query);
  }



  async createUser(userData) {
    return await User.create(userData);
  }

  async findUser(query) {
    return await User.findOne(query);
  }

  async updateUser(userData) {
    return await userData.save();
  }

}

module.exports = new authRepository();