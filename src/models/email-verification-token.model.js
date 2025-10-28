import { Schema, model } from 'mongoose';

// TTL (minutes) comes from env configuration; default to 30 minutes when unset.
const EMAIL_VERIFICATION_TTL_MINUTES = Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES ?? 30);

// Persists verification OTP codes for email confirmation. TTL ensures automatic cleanup.
const emailVerificationTokenSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

emailVerificationTokenSchema.index({ email: 1, token: 1 }, { unique: true });
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerificationTokenModel = model('EmailVerificationToken', emailVerificationTokenSchema);
