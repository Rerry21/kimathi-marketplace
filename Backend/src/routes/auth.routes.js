import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import {
  loginIpLimiter,
  loginAccountLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/signup", signupLimiter, signup);
router.post("/login", loginIpLimiter, loginAccountLimiter, login);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);

export default router;