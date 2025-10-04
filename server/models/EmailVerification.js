import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  expiresAt: { 
    type: Date, 
    required: true, 
    default: Date.now, 
    expires: 86400 
  },
  verified: {
     type: Boolean, 
     default: false },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

emailVerificationSchema.index({ email: 1, token: 1 });

export default mongoose.model("EmailVerification", emailVerificationSchema);
