import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html';
import cloudinary from 'cloudinary';
import stream from 'node:stream';
import { UserModel } from '../models/user.model.js';
import { TokenService } from './token.service.js';
import { PasswordResetTokenModel } from '../models/password-reset-token.model.js';
import { EmailVerificationTokenModel } from '../models/email-verification-token.model.js';
import { MessagingHookService } from './messaging-hook.service.js';
import { EmailService } from './email.service.js';
import { GoogleOAuthService } from './google-oauth.service.js';
import { AppError, BadRequestError, UnauthorizedError } from '../utils/errors.js';

const sanitizeValue = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (typeof value === 'string') {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  return value;
};

const sanitizePayload = (payload = {}) => {
  return Object.entries(payload).reduce((acc, [key, value]) => {
    acc[key] = sanitizeValue(value);
    return acc;
  }, {});
};

export class AuthService {
  constructor({
    userModel = UserModel,
    tokenService = new TokenService({ passwordResetTokenModel: PasswordResetTokenModel, emailVerificationTokenModel: EmailVerificationTokenModel }),
    cloudinaryClient = cloudinary.v2,
    config,
    messagingHookService = new MessagingHookService(),
    emailService = new EmailService(),
    googleOAuthService,
  } = {}) {
    if (!config) {
      throw new Error('AuthService requires config');
    }

    this.userModel = userModel;
    this.tokenService = tokenService;
    this.cloudinary = cloudinaryClient;
    this.config = config;
    this.messagingHooks = messagingHookService;
    this.emailService = emailService;

    const hasGoogleConfig = Boolean(config.googleOAuth?.clientId);
    this.googleOAuth =
      googleOAuthService ?? (hasGoogleConfig ? new GoogleOAuthService({ config }) : null);

    this.cloudinary.config({
      cloud_name: config.cloudinary?.cloudName,
      api_key: config.cloudinary?.apiKey,
      api_secret: config.cloudinary?.apiSecret,
    });
  }

  sanitize(input) {
    return sanitizePayload(input);
  }

  generateAccessToken(payload) {
    return jwt.sign(payload, this.config.auth.jwtSecret, {
      expiresIn: this.config.auth.jwtExpiresIn,
    });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, this.config.auth.refreshTokenSecret, {
      expiresIn: this.config.auth.refreshTokenExpiresIn,
    });
  }

  generateAuthTokens(user) {
    const accessToken = this.generateAccessToken({ sub: user.id, role: user.role });
    const refreshToken = this.generateRefreshToken({ sub: user.id });

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.config.auth.refreshTokenSecret);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async uploadProfileImage(fileBuffer, originalName) {
    if (!fileBuffer) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'gridspace/profiles',
          public_id: originalName ? originalName.replace(/[^a-zA-Z0-9-_]/g, '_') : undefined,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result.secure_url);
        }
      );

      const readable = stream.Readable.from(fileBuffer);
      readable.on('error', reject);
      readable.pipe(uploadStream);
    });
  }

  async registerUser(payload) {
    const sanitized = this.sanitize(payload);

    const existingUser = await this.userModel.findOne({ email: sanitized.email });
    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    if (sanitized.phoneNumber) {
      const phoneOwner = await this.userModel.findOne({ phoneNumber: sanitized.phoneNumber });
      if (phoneOwner) {
        throw new BadRequestError('Phone number already in use');
      }
    }

    const userPayload = {
      fullName: sanitized.fullName,
      email: sanitized.email,
      password: sanitized.password,
      profileImageUrl: sanitized.profileImageUrl ?? null,
      authMethod: sanitized.authMethod ?? 'local',
    };

    if (sanitized.phoneNumber) {
      userPayload.phoneNumber = sanitized.phoneNumber;
    }

    const user = await this.userModel.create(userPayload);

    const authTokens = this.generateAuthTokens(user);

    if (user.emailVerified) {
      this.messagingHooks.onUserEmailVerified(user);
    }

    return { user, ...authTokens };
  }

  async authenticateUser({ email, password }) {
    const sanitized = this.sanitize({ email, password });

    const user = await this.userModel.findOne({ email: sanitized.email });

    if (!user || !(await user.comparePassword(sanitized.password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return { user, ...this.generateAuthTokens(user) };
  }

  async refreshSession(refreshToken) {
    const payload = this.verifyRefreshToken(refreshToken);

    const user = await this.userModel.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedError('User not found for refresh token');
    }

    return { user, ...this.generateAuthTokens(user) };
  }

  async requestPasswordReset(email) {
    const sanitized = this.sanitize({ email });
    const user = await this.userModel.findOne({ email: sanitized.email });

    if (!user) {
      throw new BadRequestError('Account with this email does not exist');
    }

    const token = await this.tokenService.createPasswordResetToken(user.email);

    const emailResult = await this.emailService.sendPasswordResetEmail({
      to: user.email,
      code: token,
      userName: user.fullName ?? user.email,
    });

    if (!emailResult?.success) {
      throw new AppError('Failed to send password reset email', {
        statusCode: 500,
        code: 'EMAIL_SEND_FAILED',
        details: emailResult?.error ?? null,
      });
    }

    return { token, user };
  }

  async resetPassword({ email, token, newPassword }) {
    const sanitized = this.sanitize({ email, token, newPassword });

    const isValid = await this.tokenService.verifyPasswordResetToken(
      sanitized.email,
      sanitized.token
    );

    if (!isValid) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const user = await this.userModel.findOne({ email: sanitized.email });

    if (!user) {
      throw new BadRequestError('Account with this email does not exist');
    }

    user.password = sanitized.newPassword;
    await user.save();

    await this.tokenService.consumePasswordResetToken(sanitized.email, sanitized.token);

    return { user, ...this.generateAuthTokens(user) };
  }

  async requestEmailVerification(email) {
    const sanitized = this.sanitize({ email });
    const user = await this.userModel.findOne({ email: sanitized.email });

    if (!user) {
      throw new BadRequestError('Account with this email does not exist');
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email already verified');
    }

    const token = await this.tokenService.createEmailVerificationToken(user.email);

    const emailResult = await this.emailService.sendEmailVerificationEmail({
      to: user.email,
      code: token,
      userName: user.fullName ?? user.email,
    });

    if (!emailResult?.success) {
      throw new AppError('Failed to send verification email', {
        statusCode: 500,
        code: 'EMAIL_SEND_FAILED',
        details: emailResult?.error ?? null,
      });
    }

    return { token, user };
  }

  async verifyEmail({ email, token }) {
    const sanitized = this.sanitize({ email, token });

    const isValid = await this.tokenService.verifyEmailVerificationToken(
      sanitized.email,
      sanitized.token
    );

    if (!isValid) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    const user = await this.userModel.findOneAndUpdate(
      { email: sanitized.email },
      { emailVerified: true },
      { new: true }
    );

    await this.tokenService.consumeEmailVerificationToken(sanitized.email, sanitized.token);

    if (user) {
      this.messagingHooks.onUserEmailVerified(user);
    }

    return user;
  }

  async completeOnboarding(userId, payload) {
    const sanitized = this.sanitize(payload);

    const purposes = Array.isArray(sanitized.purposes)
      ? sanitized.purposes.filter((item) => typeof item === 'string' && item.length > 0)
      : [];

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.emailVerified) {
      throw new BadRequestError('Verify email before completing onboarding');
    }

    user.role = sanitized.role ?? user.role;
    user.location = sanitized.location;
    user.purposes = purposes;
    user.onboardingCompleted = true;

    await user.save();

    this.messagingHooks.onUserOnboarded(user);

    return user;
  }

  async authenticateWithGoogleIdToken(idToken) {
    const googleOAuth = this.#getGoogleOAuth();
    const profile = await googleOAuth.verifyIdToken(idToken);
    return this.#upsertGoogleUser(profile);
  }

  async authenticateWithGoogleCode(code) {
    const googleOAuth = this.#getGoogleOAuth();
    const profile = await googleOAuth.getUserFromCode(code);
    return this.#upsertGoogleUser(profile);
  }

  getGoogleAuthorizationUrl({ state } = {}) {
    const googleOAuth = this.#getGoogleOAuth();
    return googleOAuth.generateAuthUrl({ state });
  }

  async #upsertGoogleUser(profile) {
    const sanitized = this.sanitize(profile);

    if (!sanitized.email) {
      throw new BadRequestError('Google account email is required');
    }

    let user = null;

    if (sanitized.googleId) {
      user = await this.userModel.findOne({ googleUserId: sanitized.googleId });
    }

    if (!user) {
      user = await this.userModel.findOne({ email: sanitized.email });
    }

    if (user) {
      const wasVerified = Boolean(user.emailVerified);

      user.googleUserId = sanitized.googleId ?? user.googleUserId;
      user.fullName = sanitized.fullName ?? user.fullName;
      user.profileImageUrl = sanitized.profileImageUrl ?? user.profileImageUrl;
      user.emailVerified = sanitized.emailVerified ?? user.emailVerified;
      user.authMethod = 'google';

      await user.save();

      if (!wasVerified && user.emailVerified) {
        this.messagingHooks.onUserEmailVerified(user);
      }

      return { user, ...this.generateAuthTokens(user) };
    }

    const googleUserPayload = {
      fullName: sanitized.fullName ?? 'Google User',
      email: sanitized.email,
      password: null,
      profileImageUrl: sanitized.profileImageUrl ?? null,
      googleUserId: sanitized.googleId ?? null,
      authMethod: 'google',
      emailVerified: sanitized.emailVerified ?? false,
    };

    const createdUser = await this.userModel.create(googleUserPayload);

    if (createdUser.emailVerified) {
      this.messagingHooks.onUserEmailVerified(createdUser);
    }

    return { user: createdUser, ...this.generateAuthTokens(createdUser) };
  }

  #getGoogleOAuth() {
    if (!this.googleOAuth) {
      throw new BadRequestError('Google OAuth is not configured');
    }

    return this.googleOAuth;
  }
}
