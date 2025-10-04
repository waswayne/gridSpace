import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.model.js';
import PasswordReset from '../models/PasswordReset.js';
import EmailVerification from '../models/EmailVerification.js';
import cloudinary from '../config/cloudinary.js';
import { verifyGoogleToken, getGoogleAuthUrl, getTokensFromCode } from '../config/googleAuth.js';
import streamifier from 'streamifier';
import logger from '../config/logger.js';

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      logger.error("Cloudinary configuration missing:", {
        cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY,
        api_secret: !!process.env.CLOUDINARY_API_SECRET
      });
      reject(new Error("Cloudinary configuration is missing. Please check your environment variables."));
      return;
    }

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
          logger.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          logger.info("Cloudinary upload successful:", result.secure_url);
          resolve(result.secure_url);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// Signup controller
export const signup = async (req, res) => {
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
export const signin = async (req, res) => {
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

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
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

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { fullname, phonenumber } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!fullname && !phonenumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    // Check if phone number is being updated and if it already exists
    if (phonenumber && phonenumber !== req.user.phonenumber) {
      const existingPhone = await User.findOne({
        phonenumber,
        _id: { $ne: userId },
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }
    }

    // Prepare update object
    const updateData = {};
    if (fullname) updateData.fullname = fullname.trim();
    if (phonenumber) updateData.phonenumber = phonenumber.trim();

    // Update profile picture if file exists
    if (req.file) {
      try {
        const profilePicUrl = await uploadToCloudinary(req.file);
        updateData.profilePic = profilePicUrl;
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture",
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email address",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save reset token to database
    await PasswordReset.create({
      email: email.toLowerCase(),
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    });

    // In a real application, you would send an email here
    // For now, we'''ll just return the token (remove this in production)
    res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken, // Remove this in production
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate required fields
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide reset token and new password",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find valid reset token
    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: passwordReset.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Mark token as used
    passwordReset.used = true;
    await passwordReset.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Request email verification
export const requestEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email address",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Save verification token to database
    await EmailVerification.create({
      email: email.toLowerCase(),
      token: verificationToken,
      expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
    });

    // In a real application, you would send an email here
    // For now, we'''ll just return the token (remove this in production)
    res.status(200).json({
      success: true,
      message: "Email verification token generated",
      verificationToken, // Remove this in production
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Validate token
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Please provide verification token",
      });
    }

    // Find valid verification token
    const emailVerification = await EmailVerification.findOne({
      token,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!emailVerification) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: emailVerification.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Mark email as verified
    emailVerification.verified = true;
    await emailVerification.save();

    // Update user'''s emailVerified status
    user.emailVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Logout (client-side token removal)
export const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // You could implement a token blacklist here if needed
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const user = req.user;

    // Generate new token
    const newToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
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

// Complete onboarding
export const completeOnboarding = async (req, res) => {
  try {
    const { role, purposes, location } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required for onboarding",
      });
    }

    // Validate role
    const validRoles = ["user", "host", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: user, host, admin",
      });
    }

    // Parse purposes if it'''s a string (from form data)
    let parsedPurposes = [];
    if (purposes) {
      try {
        parsedPurposes = typeof purposes === 'string' ? JSON.parse(purposes) : purposes;
        if (!Array.isArray(parsedPurposes)) {
          parsedPurposes = [];
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid purposes format. Must be a valid JSON array",
        });
      }
    }

    // Prepare update object
    const updateData = {
      role: role.trim(),
      onboardingCompleted: true,
      purposes: parsedPurposes,
    };

    if (location) {
      updateData.location = location.trim();
    }

    // Update profile picture if file exists
    if (req.file) {
      try {
        logger.info("Uploading profile picture for onboarding...");
        const profilePicUrl = await uploadToCloudinary(req.file);
        updateData.profilePic = profilePicUrl;
        logger.info("Profile picture uploaded successfully:", profilePicUrl);
      } catch (error) {
        logger.error("Profile picture upload failed:", error);
        return res.status(500).json({
          success: false,
          message: `Failed to upload profile picture: ${error.message}`,
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide password to confirm account deletion",
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Google OAuth Signup/Signin with ID Token
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Validate required fields
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required",
      });
    }

    // Verify Google ID token
    const googleUser = await verifyGoogleToken(idToken);

    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { googleId: googleUser.googleId },
        { email: googleUser.email }
      ]
    });

    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.authProvider = 'google';
        user.emailVerified = googleUser.emailVerified;
        if (googleUser.profilePic && !user.profilePic) {
          user.profilePic = googleUser.profilePic;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        fullname: googleUser.fullname,
        email: googleUser.email,
        googleId: googleUser.googleId,
        authProvider: 'google',
        emailVerified: googleUser.emailVerified,
        profilePic: googleUser.profilePic,
        phonenumber: `+${Math.floor(Math.random() * 9000000000) + 1000000000}`, // Generate random phone for Google users
      });

      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response with token and user info
    res.status(200).json({
      success: true,
      message: user.googleId ? "Google signin successful" : "Google signup successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: error.message,
    });
  }
};

// Get Google OAuth URL
export const getGoogleAuthUrlController = async (req, res) => {
  try {
    const authUrl = getGoogleAuthUrl();
    
    res.status(200).json({
      success: true,
      message: "Google auth URL generated",
      authUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate Google auth URL",
      error: error.message,
    });
  }
};

// Google OAuth Callback (for server-side flow)
export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required",
      });
    }

    // Exchange code for tokens and get user info
    const googleUser = await getTokensFromCode(code);

    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { googleId: googleUser.googleId },
        { email: googleUser.email }
      ]
    });

    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.authProvider = 'google';
        user.emailVerified = googleUser.emailVerified;
        if (googleUser.profilePic && !user.profilePic) {
          user.profilePic = googleUser.profilePic;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        fullname: googleUser.fullname,
        email: googleUser.email,
        googleId: googleUser.googleId,
        authProvider: 'google',
        emailVerified: googleUser.emailVerified,
        profilePic: googleUser.profilePic,
        phonenumber: `+${Math.floor(Math.random() * 9000000000) + 1000000000}`, // Generate random phone for Google users
      });

      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&success=true`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?success=false&error=${encodeURIComponent(error.message)}`);
  }
};