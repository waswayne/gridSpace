import { AuthService } from '../services/auth.service.js';
import { getConfig } from '../config/env.js';

// Orchestrates HTTP-level auth flows by delegating to AuthService and shaping responses.
export class AuthController {
  constructor({ authService, config = getConfig() } = {}) {
    this.config = config;
    this.authService = authService ?? new AuthService({ config: this.config });

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
    this.requestPasswordReset = this.requestPasswordReset.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.requestEmailVerification = this.requestEmailVerification.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.completeOnboarding = this.completeOnboarding.bind(this);
    this.googleSignInWithIdToken = this.googleSignInWithIdToken.bind(this);
    this.googleSignInWithCode = this.googleSignInWithCode.bind(this);
    this.googleAuthUrl = this.googleAuthUrl.bind(this);
  }

  async register(req, res, next) {
    try {
      const { fullName, email, password, phoneNumber } = req.body;

      let profileImageUrl = null;
      if (req.file) {
        profileImageUrl = await this.authService.uploadProfileImage(
          req.file.buffer,
          req.file.originalname
        );
      }

      const { user, accessToken, refreshToken } = await this.authService.registerUser({
        fullName,
        email,
        password,
        phoneNumber,
        profileImageUrl,
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await this.authService.authenticateUser({
        email,
        password,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshSession(refreshToken);

      const payload = {
        success: true,
        message: 'Session refreshed',
        data: {
          user,
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        },
      };

      if (this.config.nodeEnv !== 'production') {
        payload.data.debug = { refreshToken: newRefreshToken };
      }

      return res.status(200).json(payload);
    } catch (error) {
      return next(error);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      const { token } = await this.authService.requestPasswordReset(email);

      const response = {
        success: true,
        message: 'Password reset OTP issued. Check your email for the code.',
      };

      if (this.config.nodeEnv !== 'production') {
        response.debugToken = token;
      }

      return res.status(200).json(response);
    } catch (error) {
      return next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, token, newPassword } = req.body;
      const { user, accessToken, refreshToken } = await this.authService.resetPassword({
        email,
        token,
        newPassword,
      });

      return res.status(200).json({
        success: true,
        message: 'Password updated successfully',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async requestEmailVerification(req, res, next) {
    try {
      const { email } = req.body;
      const { token } = await this.authService.requestEmailVerification(email);

      const response = {
        success: true,
        message: 'Verification OTP issued. Check your email for the code.',
      };

      if (this.config.nodeEnv !== 'production') {
        response.debugToken = token;
      }

      return res.status(200).json(response);
    } catch (error) {
      return next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { email, token } = req.body;
      const user = await this.authService.verifyEmail({ email, token });

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: { user },
      });
    } catch (error) {
      return next(error);
    }
  }

  async completeOnboarding(req, res, next) {
    try {
      const { role, location, purposes } = req.body;
      const user = await this.authService.completeOnboarding(req.user.id, {
        role,
        location,
        purposes,
      });

      return res.status(200).json({
        success: true,
        message: 'Onboarding completed successfully',
        data: { user },
      });
    } catch (error) {
      return next(error);
    }
  }

  async googleSignInWithIdToken(req, res, next) {
    try {
      const { idToken } = req.body;
      const { user, accessToken, refreshToken } =
        await this.authService.authenticateWithGoogleIdToken(idToken);

      return res.status(200).json({
        success: true,
        message: 'Google sign-in successful',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async googleSignInWithCode(req, res, next) {
    try {
      const { code } = req.body;
      const { user, accessToken, refreshToken } =
        await this.authService.authenticateWithGoogleCode(code);

      return res.status(200).json({
        success: true,
        message: 'Google OAuth exchange successful',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async googleAuthUrl(req, res, next) {
    try {
      const { state } = req.query;
      const url = this.authService.getGoogleAuthorizationUrl({ state });

      return res.status(200).json({
        success: true,
        message: 'Google authorization URL generated',
        data: { url },
      });
    } catch (error) {
      return next(error);
    }
  }
}
