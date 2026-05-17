
const otpEmail = (username, otp )=>({
    subject:"SmartReach OTP Verification",
    text: `Hello ${username},\nYour OTP is: ${otp}\nValid for 5 minutes.`
});

const passwordResetEmail = (resetUrl)=>({
    subject: "SmartReach Password Reset",
    text: `Click the link below to reset your password (valid 10 minutes):\n\n ${resetUrl}`
});

module.exports = {otpEmail, passwordResetEmail};