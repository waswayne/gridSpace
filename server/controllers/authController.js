const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "gridspace/profiles",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    require("streamifier").createReadStream(file.buffer).pipe(uploadStream);
  });
};

// Signup controller
const signup = async (req, res) => {
  try {
    const { fullname, email, password, phonenumber } = req.body;

    // Validate required fields
    if (!fullname || !email || !password || !phonenumber) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: fullname, email, password, phonenumber",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ phonenumber });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists",
      });
    }

    let profilePicUrl = null;

    // Upload profile picture to Cloudinary if file exists
    if (req.file) {
      try {
        profilePicUrl = await uploadToCloudinary(req.file);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture",
        });
      }
    }

    // Create new user
    const user = new User({
      fullname: fullname.trim(),
      email: email.toLowerCase().trim(),
      password,
      phonenumber: phonenumber.trim(),
      profilePic: profilePicUrl,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response with token and user info (password excluded automatically)
    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Signin controller
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response with token and user info (password excluded automatically)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  signup,
  signin,
};
