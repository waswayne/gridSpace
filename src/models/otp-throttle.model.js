import { Schema, model } from 'mongoose';

const ONE_HOUR_MS = 60 * 60 * 1000;

const otpThrottleSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['password-reset', 'email-verification'],
    },
    requestCount: {
      type: Number,
      required: true,
      default: 0,
    },
    windowStartedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    nextAllowedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + ONE_HOUR_MS * 2),
    },
  },
  {
    timestamps: true,
  }
);

otpThrottleSchema.index({ email: 1, type: 1 }, { unique: true });
otpThrottleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpThrottleModel = model('OtpThrottle', otpThrottleSchema);
