const authRepository = require('../../../repos/authRepository');

class AuthController {
    constructor(router) {
        router.post('/register', this.register.bind(this));
        router.post('/verifyOtp', this.verifyOtp.bind(this));
        router.post('/resendOtp', this.resendOtp.bind(this));
        router.post('/login', this.login.bind(this));
        router.post('/forgotPassword', this.forgotPassword.bind(this));
        router.post('/resetPassword', this.resetPassword.bind(this));
    }

    // ================= REGISTER =================
    async register(req, res) {
        try {
            console.log("***** controller.register ok");

            const result = await authRepository.register(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.register : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    // ================= VERIFY OTP =================
    async verifyOtp(req, res) {
        try {
            console.log("***** controller.verifyOtp ok");

            const result = await authRepository.verifyOtp(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.verifyOtp : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    // ================= RESEND OTP =================
    async resendOtp(req, res) {
        try {
            console.log("***** controller.resendOtp ok");

            const result = await authRepository.resendOtp(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.resendOtp : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    // ================= LOGIN =================
    async login(req, res) {
        try {
            console.log("***** controller.login ok");

            const result = await authRepository.login(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.login : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    // ================= FORGOT PASSWORD =================
    async forgotPassword(req, res) {
        try {
            console.log("***** controller.forgotPassword ok");

            const result = await authRepository.forgotPassword(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.forgotPassword : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    // ================= RESET PASSWORD =================
    async resetPassword(req, res) {
        try {
            console.log("***** controller.resetPassword ok");

            const result = await authRepository.resetPassword(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.resetPassword : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = AuthController;