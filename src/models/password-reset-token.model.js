import { Schema, model } from 'mongoose';

// Resolve TTL (minutes) from environment; fall back to 60 min to avoid breaking flows in local dev.
const PASSWORD_RESET_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES ?? 60);

// Stores short-lived OTP tokens for password reset flows. Documents expire automatically via TTL index.
const passwordResetTokenSchema = new Schema(
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
      default: () => new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

passwordResetTokenSchema.index({ email: 1, token: 1 }, { unique: true });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetTokenModel = model('PasswordResetToken', passwordResetTokenSchema);
