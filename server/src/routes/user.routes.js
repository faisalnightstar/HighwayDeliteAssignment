import { Router } from "express";
import passport from "passport";
import {
    sendRegistrationOtp,
    verifyOtpAndRegister,
    sendLoginOtp,
    resendOtp,
    getCurrentUser,
    verifyLoginOtpAndSignIn,
    googleCallbackHandler,
    resendVerificationOtp,
    forgotPassword,
    resetPassword,
    logoutUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// EMAIL & OTP SIGNUP
router.route("/send-otp").post(sendRegistrationOtp);

router.route("/register").post(verifyOtpAndRegister);

// EMAIL & OTP LOGIN
router.route("/login-otp").post(sendLoginOtp);
router.route("/verify-login").post(verifyLoginOtpAndSignIn);

// GOOGLE OAUTH
router
    .route("/google")
    .get(passport.authenticate("google", { scope: ["profile", "email"] }));
router.route("/google/callback").get(
    passport.authenticate("google", {
        failureRedirect: "/api/v1/users/google/failure",
        session: false,
    }),
    googleCallbackHandler
);

// Simple failure handler
router.route("/google/failure").get((req, res) => {
    res.status(401).json({
        success: false,
        message: "Google authentication failed.",
    });
});
// Route to re-send a verification email
router.route("/resend-otp").post(resendOtp);

// Routes for password reset
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
