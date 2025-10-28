import crypto from 'crypto';
import { PasswordResetTokenModel } from '../models/password-reset-token.model.js';
import { EmailVerificationTokenModel } from '../models/email-verification-token.model.js';

// Helper responsible for generating and persisting OTP-based tokens used in auth flows.
export class TokenService {
  constructor({ passwordResetTokenModel = PasswordResetTokenModel, emailVerificationTokenModel = EmailVerificationTokenModel } = {}) {
    this.passwordResetTokenModel = passwordResetTokenModel;
    this.emailVerificationTokenModel = emailVerificationTokenModel;
  }

  // Generates a numeric OTP of the specified length.
  static generateNumericOtp(length = 6) {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i += 1) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }

    return otp;
  }

  async createPasswordResetToken(email, length = 6) {
    const otp = TokenService.generateNumericOtp(length);

    await this.passwordResetTokenModel.findOneAndDelete({ email });

    const record = await this.passwordResetTokenModel.create({
      email,
      token: otp,
    });

    return record.token;
  }

  async verifyPasswordResetToken(email, token) {
    const record = await this.passwordResetTokenModel.findOne({ email, token });

    return Boolean(record);
  }

  async consumePasswordResetToken(email, token) {
    await this.passwordResetTokenModel.deleteOne({ email, token });
  }

  async createEmailVerificationToken(email, length = 6) {
    const otp = TokenService.generateNumericOtp(length);

    await this.emailVerificationTokenModel.findOneAndDelete({ email });

    const record = await this.emailVerificationTokenModel.create({
      email,
      token: otp,
    });

    return record.token;
  }

  async verifyEmailVerificationToken(email, token) {
    const record = await this.emailVerificationTokenModel.findOne({ email, token });

    return Boolean(record);
  }

  async consumeEmailVerificationToken(email, token) {
    await this.emailVerificationTokenModel.deleteOne({ email, token });
  }
}
