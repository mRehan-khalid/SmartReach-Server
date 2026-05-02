const User = require('../models/userModel');

const validateRegister = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        code: "USER_EXISTS",
        message: "Account already exists. Please login."
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = validateRegister;