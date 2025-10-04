import express from 'express';
const router = express.Router();
import {
  signup,
  signin,
  getProfile,
  updateProfile,
  completeOnboarding,
  changePassword,
  requestPasswordReset,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
  logout,
  refreshToken,
  deleteAccount,
  googleAuth,
  getGoogleAuthUrlController,
  googleCallback,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../config/multer.js';

// Public routes
router.post("/signup", upload.single("profilePic"), signup);
router.post("/signin", signin);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/request-email-verification", requestEmailVerification);
router.post("/verify-email", verifyEmail);

// Google OAuth routes
router.post("/google", googleAuth);
router.get("/google/url", getGoogleAuthUrlController);
router.get("/google/callback", googleCallback);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, upload.single("profilePic"), updateProfile);
router.post("/onboarding", authenticate, upload.single("profilePic"), completeOnboarding);
router.put("/change-password", authenticate, changePassword);
router.post("/logout", authenticate, logout);
router.post("/refresh-token", authenticate, refreshToken);
router.delete("/account", authenticate, deleteAccount);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

export default router;