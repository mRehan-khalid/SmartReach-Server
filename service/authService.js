const transporter = require("../config/mailConfig");
const logger = require("../lib/logger");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const authRepository = require("../repos/authRepository");
const { otpEmail, passwordResetEmail } = require('../utilities/emailTemplate');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

class AuthService {

  async register(data) {
    try {
      console.log("********** authService.register started **********");
      const { username, email, password } = data;

      console.log("authService.register - Checking existing user:", email);
      const existingUser = await authRepository.findUserByEmailOrUsername(email, username);

      if (existingUser) {
        console.log("authService.register - ❌ User already exists");
        return { status: 409, code: "USER_EXISTS", message: "Account already exists. Please login." };
      }

      console.log("authService.register - Generating Encrypted Password");
      let hashedPassword = await bcrypt.hash(password, 10);
      console.log("authService.register - ✅ Password Encrypted");

      const existingPendingUser = await authRepository.findPendingUser({ email });
      let otp, expiresAt;

      if (existingPendingUser) {
        console.log("authService.register - User already exists in Pending List");
        const isValid = existingPendingUser.expiresAt > new Date();

        if (isValid) {
          console.log("authService.register - Using existing OTP");
          otp = existingPendingUser.otp;
          expiresAt = existingPendingUser.expiresAt;
          existingPendingUser.password = hashedPassword;
          await authRepository.updatePendingUser(existingPendingUser);
        } else {
          console.log("authService.register - OTP expired, generating new one");
          otp = generateOtp();
          expiresAt = new Date(Date.now() + 5 * 60 * 1000);
          existingPendingUser.otp = otp;
          existingPendingUser.expiresAt = expiresAt;
          existingPendingUser.password = hashedPassword;
          await authRepository.updatePendingUser(existingPendingUser);
        }
      } else {
        console.log("authService.register - Creating new Pending User");
        otp = generateOtp();
        expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        const pendingUserData = { username, email, password: hashedPassword, otp, expiresAt };
        await authRepository.createPendingUser(pendingUserData);
        console.log("authService.register - ✅ New User created in Pending List");
      }

      await this.sendOtpEmail(email, username, otp);
      console.log("********** authService.register - ✅ Registration Successful **********");
      return { status: 200, message: "OTP sent. Verify to complete registration." };

    } catch (error) {
      console.error("********** ❌ authService.register - Error **********");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      logger.error("authService.register - Error", { message: error.message, stack: error.stack });
      return { status: 500, message: "Server error" };
    }
  }

  async sendOtpEmail(email, username, otp) {
    try {
      console.log("********** authService.sendOtpEmail started **********");
      const template = otpEmail(username, otp);
      await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, ...template });
      console.log("********** authService.sendOtpEmail - ✅ OTP Successfully Sent **********");
    } catch (error) {
      console.error("********** ❌ authService.sendOtpEmail - Error **********");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      logger.error("authService.sendOtpEmail - Error", { message: error.message, stack: error.stack });
      throw error;
    }
  }

  async resendOtp(data) {
    try {
      console.log("********** authService.resendOtp started **********");
      const { email } = data;

      console.log("authService.resendOtp - Finding User in Pending List");
      const pendingUser = await authRepository.findPendingUser({ email });
      if (!pendingUser) {
        console.log("authService.resendOtp - ❌ No User Found in Pending List");
        return { status: 404, code: "SESSION_EXPIRED", message: "Your signup session has expired. Please start again." };
      }

      console.log("authService.resendOtp - ✅ User Found - Generating NEW OTP");
      const otp = generateOtp();
      const now = new Date();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      pendingUser.otp = otp;
      pendingUser.expiresAt = expiresAt;
      pendingUser.createdAt = now;

      await authRepository.updatePendingUser(pendingUser);
      console.log("authService.resendOtp - ✅ OTP Updated in Pending List");

      await this.sendOtpEmail(pendingUser.email, pendingUser.username, otp);
      console.log("********** authService.resendOtp - ✅ OTP Resent Successfully **********");
      return { status: 200, message: "New OTP sent successfully", remainingTime: 30 };

    } catch (error) {
      console.error("********** ❌ authService.resendOtp - Error **********");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      logger.error("authService.resendOtp - Error", { message: error.message, stack: error.stack });
      return { status: 500, message: "Server error" };
    }
  }

  async verifyOtp(data) {
    try {
      console.log("********** authService.verifyOtp started **********");
      const { email, otp } = data;

      console.log("authService.verifyOtp - Finding User in Pending List");
      const pendingUser = await authRepository.findPendingUser({ email });
      if (!pendingUser) {
        console.log("authService.verifyOtp - ❌ No Pending User Found");
        return { status: 404, message: "No pending registration found" };
      }

      console.log("authService.verifyOtp - Verifying OTP");
      if (pendingUser.otp !== otp) {
        console.log("authService.verifyOtp - ❌ Invalid OTP");
        return { status: 400, message: "Invalid OTP" };
      }

      if (pendingUser.expiresAt < new Date()) {
        console.log("authService.verifyOtp - ❌ OTP Expired");
        return { status: 400, message: "OTP expired" };
      }

      console.log("authService.verifyOtp - ✅ OTP Verified - Creating User");
      const userData = {
        username: pendingUser.username,
        email: pendingUser.email,
        password: pendingUser.password
      };

      const user = await authRepository.createUser(userData);
      await authRepository.deletePendingUser({ email });

      console.log("********** authService.verifyOtp - ✅ User Created Successfully **********");
      return { status: 201, message: "Registration complete", userId: user._id };

    } catch (error) {
      console.error("********** ❌ authService.verifyOtp - Error **********");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      logger.error("authService.verifyOtp - Error", { message: error.message, stack: error.stack });
      return { status: 500, message: "Server error" };
    }
  }

  async login(data) {
    try {
      console.log("********** authService.login started **********");
      const { email, password } = data;

      if (!email || !password) {
        console.log("authService.login - ❌ Missing Fields");
        return { status: 400, message: "Email and password required" };
      }

      console.log("authService.login - Finding User");
      const user = await authRepository.findUser({ email });
      if (!user) {
        console.log("authService.login - ❌ User Not Found");
        return { status: 401, message: "Invalid credentials" };
      }

      console.log("authService.login - Comparing Password");
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("authService.login - ❌ Password Incorrect");
        return { status: 401, message: "Invalid credentials" };
      }

      console.log("authService.login - Generating Token");
      const token = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      console.log("********** authService.login - ✅ Login Successful **********");
      return {
        status: 200,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isProfileComplete: user.isProfileComplete
        }
      };

    } catch (error) {
      console.error("********** ❌ authService.login - Error **********");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      logger.error("authService.login - Error", { message: error.message, stack: error.stack });
      return { status: 500, message: "Server error" };
    }
  }

  async forgotPassword(data) {
    try {
      console.log("********** authService.forgotPassword started **********");
      const { email } = data;

      if (!email) {
        console.log("authService.forgotPassword - ❌ Email Missing");
        return { status: 400, message: "Email is required" };
      }

      console.log("authService.forgotPassword - Finding User");
      const user = await authRepository.findUser({ email });
      if (!user) {
        console.log("authService.forgotPassword - ❌ User Not Found");
        return { status: 404, message: "User not found" };
      }

      console.log("authService.forgotPassword - Generating Reset Token");
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await authRepository.updateUser(user);

      const resetUrl = `${process.env.FRONTEND_URL}/resetPassword?token=${resetToken}&email=${email}`;
      const template = passwordResetEmail(resetUrl);

      await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, ...template });

      console.log("********** authService.forgotPassword - ✅ Reset Email Sent **********");
      return { status: 200, message: "Password reset link sent to email" };

    } catch (error) {
      console.error("********** ❌ authService.forgotPassword - Error **********");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      logger.error("authService.forgotPassword - Error", { message: error.message, stack: error.stack });
      return { status: 500, message: "Server error" };
    }
  }

  async resetPassword(data) {
    try {
      console.log("********** authService.resetPassword started **********");
      const { email, token, newPassword } = data;

      if (!email || !token || !newPassword) {
        console.log("authService.resetPassword - ❌ Missing Fields");
        return { status: 400, message: "All fields are required" };
      }

      console.log("authService.resetPassword - Finding User with Reset Token");
      const user = await authRepository.findUser({
        email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        console.log("authService.resetPassword - ❌ Invalid or Expired Token");
        return { status: 400, message: "Invalid or expired token" };
      }

      console.log("authService.resetPassword - Hashing New Password");
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await authRepository.updateUser(user);

      console.log("********** authService.resetPassword - ✅ Password Reset Successful **********");
      return { status: 200, message: "Password reset successful" };

    } catch (error) {
      console.error("********** ❌ authService.resetPassword - Error **********");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      logger.error("authService.resetPassword - Error", { message: error.message, stack: error.stack });
      return { status: 500, message: "Server error" };
    }
  }
}

module.exports = new AuthService();