import { Router } from "express";
import {
  loginUser,
  changeCurrentPassword,
  registerUser,
  logoutUser,
  refreshAccessToken,
  deleteAccount,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/delete-account").delete(verifyJWT, deleteAccount);

export default router;
