const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
  logout,
  refreshToken,
  deleteAccount,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const upload = require("../config/multer");

// Public routes (no authentication required)
router.post("/signup", upload.single("profilePic"), signup);
router.post("/signin", signin);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/request-email-verification", requestEmailVerification);
router.post("/verify-email", verifyEmail);

// Protected routes (authentication required)
router.get("/profile", authenticate, getProfile);
router.put(
  "/profile",
  authenticate,
  upload.single("profilePic"),
  updateProfile
);
router.put("/change-password", authenticate, changePassword);
router.post("/logout", authenticate, logout);
router.post("/refresh-token", authenticate, refreshToken);
router.delete("/account", authenticate, deleteAccount);

// Test route (can be removed in production)
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

module.exports = router;
