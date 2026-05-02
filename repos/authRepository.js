const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const transporter = require("../config/mailConfig");
const User = require('../models/userModel');
const PendingUsers = require('../models/pendingUserModel');

// OTP generator
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

class AuthRepository {

  // ================= REGISTER =================

async register(data) {
  try {
    console.log("***** repo.register ok");
    const { username, email, password } = data;
    const existingPending = await PendingUsers.findOne({ email });
    let otp;
    let expiresAt;
    let hashedPassword = await bcrypt.hash(password, 10);
    if (existingPending) {
      const isValid = existingPending.expiresAt > new Date();
      
      if (isValid) {
        otp = existingPending.otp;
        expiresAt = existingPending.expiresAt;
        existingPending.hashedPassword = hashedPassword;
      } else {
        otp = generateOtp();
        expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        existingPending.otp = otp;
        existingPending.expiresAt = expiresAt;
        existingPending.password = hashedPassword;
        await existingPending.save();
      }

    } else {
      otp = generateOtp();
      expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await PendingUsers.create({
        username,
        email,
        password: hashedPassword,
        otp,
        expiresAt
      });
    }
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SmartReach OTP Verification",
      text: `Hello ${username},\nYour OTP is: ${otp}\nValid for 5 minutes.`
    });

    return {
      status: 200,
      message: "OTP sent. Verify to complete registration."
    };

  } catch (error) {
    console.error("***** repo.register : error", error);
    return { status: 500, message: "Server error" };
  }
}

  async handlePendingRegistration(existingPending, userData) {
  try {
    console.log("***** repo.handlePendingRegistration ok");

    const { username, email, password } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (existingPending) {
      // Update existing pending user
      existingPending.otp = otp;
      existingPending.expiresAt = expiresAt;
      await existingPending.save();
    } else {
      // Create new pending user
      await PendingUsers.create({
        username,
        email,
        password: hashedPassword,
        otp,
        expiresAt
      });
    }

    await this.sendOtpEmail(email, username, otp);

    return {
      status: 200,
      message: "OTP sent. Please verify your email."
    };

  } catch (error) {
    console.error("***** repo.handlePendingRegistration : error", error);
    return { status: 500, message: "Server error" };
  }
}



async sendOtpEmail(email, username, otp) {
  try {
    console.log("***** repo.sendOtpEmail ok");

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SmartReach OTP Verification",
      text: `Hello ${username},\nYour OTP is: ${otp}\nValid for 10 minutes.`
    });

  } catch (error) {
    console.error("***** repo.sendOtpEmail : error", error);
    throw error; // let parent handle
  }
}




  // ================= VERIFY OTP =================
  async verifyOtp(data) {
    try {
      console.log("***** repo.verifyOtp ok");

      const { email, otp } = data;

      const pendingUser = await PendingUsers.findOne({ email });
      if (!pendingUser)
        return { status: 404, message: "No pending registration found" };

      if (pendingUser.otp !== otp)
        return { status: 400, message: "Invalid OTP" };

      if (pendingUser.expiresAt < new Date())
        return { status: 400, message: "OTP expired" };

      const user = await User.create({
        username: pendingUser.username,
        email: pendingUser.email,
        password: pendingUser.password
      });

      await PendingUsers.deleteOne({ email });

      return { status: 201, message: "Registration complete", userId: user._id };

    } catch (error) {
      console.error("***** repo.verifyOtp : error", error);
      return { status: 500, message: "Server error" };
    }
  }

  // ================= LOGIN =================
  async login(data) {
    try {
      console.log("***** repo.login ok");

      const { email, password } = data;
      if (!email || !password)
        return { status: 400, message: "Email and password required" };

      const user = await User.findOne({ email });
      if (!user)
        return { status: 401, message: "Invalid credentials" };

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return { status: 401, message: "Invalid credentials" };

      const token = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      return { status: 200, message: "Login successful", token };

    } catch (error) {
      console.error("***** repo.login : error", error);
      return { status: 500, message: "Server error" };
    }
  }

  // ================= FORGOT PASSWORD =================
  async forgotPassword(data) {
    try {
      console.log("***** repo.forgotPassword ok");

      const { email } = data;
      if (!email)
        return { status: 400, message: "Email is required" };

      const user = await User.findOne({ email });
      if (!user)
        return { status: 404, message: "User not found" };

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      const resetUrl = `https://yourfrontend.com/resetPassword?token=${resetToken}&email=${email}`;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "SmartReach Password Reset",
        text: `Click the link below to reset your password (valid 10 minutes):\n\n ${resetUrl}`
      });

      return { status: 200, message: `Password reset link sent to email: ${resetUrl}` };

    } catch (error) {
      console.error("***** repo.forgotPassword : error", error);
      return { status: 500, message: "Server error" };
    }
  }

  // ================= RESET PASSWORD =================
  async resetPassword(data) {
    try {
      console.log("***** repo.resetPassword ok");

      const { email, token, newPassword } = data;
      if (!email || !token || !newPassword)
        return { status: 400, message: "All fields are required" };

      const user = await User.findOne({
        email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user)
        return { status: 400, message: "Invalid or expired token" };

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return { status: 200, message: "Password reset successful" };

    } catch (error) {
      console.error("***** repo.resetPassword : error", error);
      return { status: 500, message: "Server error" };
    }
  }
}

module.exports = new AuthRepository();