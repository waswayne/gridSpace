const express = require("express");
const router = express.Router();
const { signup, signin } = require("../controllers/authController");
const upload = require("../config/multer");

// Signup route with file upload middleware
router.post("/signup", upload.single("profilePic"), signup);

// Signin route
router.post("/signin", signin);

// Test route (can be removed in production)
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

module.exports = router;
