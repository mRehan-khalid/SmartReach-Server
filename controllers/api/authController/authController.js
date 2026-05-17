const authRepository = require('../../../repos/authRepository');
const otpCooldown = require('../../../middleware/otpCooldownMiddleware');
const authService = require('../../../service/authService');

class AuthController {
    constructor(router) {
        // router.post('/validateUserSignUp', this.validateUserSignUp.bind(this));
        router.post('/register', this.register.bind(this));
        router.post('/verifyOtp', this.verifyOtp.bind(this));
        router.post('/resendOtp',this.resendOtp.bind(this));
        router.post('/login', this.login.bind(this));
        router.post('/forgotPassword', this.forgotPassword.bind(this));
        router.post('/resetPassword', this.resetPassword.bind(this));
    }


    async register(req, res) {
        try {
            console.log("***** controller.register ok");

            const result = await authService.register(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.register : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }
    
    async resendOtp(req, res) {
        try {
            console.log("***** controller.resendOtp ok");

            const result = await authService.resendOtp(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.resendOtp : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }
    async verifyOtp(req, res) {
        try {
            console.log("***** controller.verifyOtp ok");

            const result = await authService.verifyOtp(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.verifyOtp : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }


    async login(req, res) {
        try {
            console.log("***** controller.login ok");

            const result = await authService.login(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.login : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    async forgotPassword(req, res) {
        try {
            console.log("***** controller.forgotPassword ok");

            const result = await authService.forgotPassword(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.forgotPassword : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    async resetPassword(req, res) {
        try {
            console.log("***** controller.resetPassword ok");

            const result = await authService.resetPassword(req.body);
            return res.status(result.status).json(result);

        } catch (error) {
            console.error("***** controller.resetPassword : error", error);
            return res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = AuthController;