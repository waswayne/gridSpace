import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../src/services/auth.service.js';

const baseConfig = {
  nodeEnv: 'test',
  auth: {
    jwtSecret: 'a'.repeat(64),
    jwtExpiresIn: '1h',
    refreshTokenSecret: 'b'.repeat(64),
    refreshTokenExpiresIn: '7d',
  },
  cloudinary: {
    cloudName: 'demo',
    apiKey: 'key',
    apiSecret: 'secret',
  },
};

const createUserModelMock = () => ({
  findOne: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  findOneAndUpdate: vi.fn(),
});

const createTokenServiceMock = () => ({
  createPasswordResetToken: vi.fn(),
  verifyPasswordResetToken: vi.fn(),
  consumePasswordResetToken: vi.fn(),
  createEmailVerificationToken: vi.fn(),
  verifyEmailVerificationToken: vi.fn(),
  consumeEmailVerificationToken: vi.fn(),
});

const createMessagingHookMock = () => ({
  onUserEmailVerified: vi.fn(),
  onUserOnboarded: vi.fn(),
});

const createGoogleOAuthMock = () => ({
  verifyIdToken: vi.fn(),
  getUserFromCode: vi.fn(),
  generateAuthUrl: vi.fn(),
});

const createEmailServiceMock = () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'msg-reset' }),
  sendEmailVerificationEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'msg-verify' }),
});

describe('AuthService', () => {
  let userModel;
  let tokenService;
  let messagingHooks;
  let cloudinaryClient;
  let service;
  let emailService;

  beforeEach(() => {
    userModel = createUserModelMock();
    tokenService = createTokenServiceMock();
    messagingHooks = createMessagingHookMock();
    cloudinaryClient = {
      config: vi.fn(),
      uploader: {
        upload_stream: vi.fn(),
      },
    };
    emailService = createEmailServiceMock();

    service = new AuthService({
      userModel,
      tokenService,
      cloudinaryClient,
      config: baseConfig,
      messagingHookService: messagingHooks,
      emailService,
    });
  });

  it('registers a new user and returns auth tokens', async () => {
    userModel.findOne.mockResolvedValue(null);
    userModel.create.mockResolvedValue({ id: 'user-1', role: 'user', emailVerified: false });

    const result = await service.registerUser({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    });

    expect(userModel.create).toHaveBeenCalledWith({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
      profileImageUrl: null,
      authMethod: 'local',
    });
    expect(result.user.id).toBe('user-1');
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(messagingHooks.onUserEmailVerified).not.toHaveBeenCalled();
  });

  it('authenticates a user with valid credentials', async () => {
    const userDoc = {
      id: 'user-2',
      role: 'user',
      comparePassword: vi.fn().mockResolvedValue(true),
    };
    userModel.findOne.mockResolvedValue(userDoc);

    const result = await service.authenticateUser({ email: 'john@example.com', password: 'secret' });

    expect(userDoc.comparePassword).toHaveBeenCalledWith('secret');
    expect(result.user).toBe(userDoc);
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
  });

  it('refreshes a session and rotates tokens', async () => {
    const userDoc = { id: 'user-3', role: 'user' };
    userModel.findById.mockResolvedValue(userDoc);

    const { refreshToken } = service.generateAuthTokens(userDoc);
    const result = await service.refreshSession(refreshToken);

    expect(userModel.findById).toHaveBeenCalledWith('user-3');
    expect(result.user).toEqual(userDoc);
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
  });

  it('creates a password reset token for existing users', async () => {
    const userDoc = { id: 'user-4', email: 'reset@example.com', fullName: 'Reset User' };
    userModel.findOne.mockResolvedValue(userDoc);
    tokenService.createPasswordResetToken.mockResolvedValue('654321');

    const result = await service.requestPasswordReset('reset@example.com');

    expect(tokenService.createPasswordResetToken).toHaveBeenCalledWith('reset@example.com');
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith({
      to: 'reset@example.com',
      code: '654321',
      userName: 'Reset User',
    });
    expect(result).toEqual({ token: '654321', user: userDoc });
  });

  it('resets password when OTP is valid', async () => {
    const save = vi.fn();
    const userDoc = { id: 'user-5', role: 'user', email: 'reset@example.com', save };
    tokenService.verifyPasswordResetToken.mockResolvedValue(true);
    userModel.findOne.mockResolvedValue(userDoc);

    const result = await service.resetPassword({
      email: 'reset@example.com',
      token: '123456',
      newPassword: 'new-secret',
    });

    expect(userDoc.password).toBe('new-secret');
    expect(save).toHaveBeenCalled();
    expect(tokenService.consumePasswordResetToken).toHaveBeenCalledWith('reset@example.com', '123456');
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
  });

  it('issues verification token for unverified users', async () => {
    const userDoc = { id: 'user-6', emailVerified: false, email: 'verify@example.com', fullName: 'Verify User' };
    userModel.findOne.mockResolvedValue(userDoc);
    tokenService.createEmailVerificationToken.mockResolvedValue('999000');

    const result = await service.requestEmailVerification('verify@example.com');

    expect(tokenService.createEmailVerificationToken).toHaveBeenCalledWith('verify@example.com');
    expect(emailService.sendEmailVerificationEmail).toHaveBeenCalledWith({
      to: 'verify@example.com',
      code: '999000',
      userName: 'Verify User',
    });
    expect(result).toEqual({ token: '999000', user: userDoc });
  });

  it('verifies email and triggers messaging hook', async () => {
    const userDoc = { id: 'user-7', email: 'verify@example.com', emailVerified: true };
    tokenService.verifyEmailVerificationToken.mockResolvedValue(true);
    userModel.findOneAndUpdate.mockResolvedValue(userDoc);

    const result = await service.verifyEmail({ email: 'verify@example.com', token: '888111' });

    expect(tokenService.consumeEmailVerificationToken).toHaveBeenCalledWith('verify@example.com', '888111');
    expect(messagingHooks.onUserEmailVerified).toHaveBeenCalledWith(userDoc);
    expect(result).toBe(userDoc);
  });

  it('completes onboarding for verified users and triggers messaging hook', async () => {
    const save = vi.fn();
    const userDoc = {
      id: 'user-8',
      role: 'user',
      emailVerified: true,
      onboardingCompleted: false,
      save,
    };
    userModel.findById.mockResolvedValue(userDoc);

    const result = await service.completeOnboarding('user-8', {
      role: 'host',
      location: ' Lagos ',
      purposes: [' events ', ''],
    });

    expect(userDoc.role).toBe('host');
    expect(userDoc.location).toBe('Lagos');
    expect(userDoc.purposes).toEqual(['events']);
    expect(userDoc.onboardingCompleted).toBe(true);
    expect(save).toHaveBeenCalled();
    expect(messagingHooks.onUserOnboarded).toHaveBeenCalledWith(userDoc);
    expect(result).toBe(userDoc);
  });

  it('throws if onboarding attempted before email verification', async () => {
    userModel.findById.mockResolvedValue({ emailVerified: false });

    await expect(
      service.completeOnboarding('user-9', { role: 'user', location: 'Abuja' })
    ).rejects.toThrow('Verify email before completing onboarding');
  });

  it('authenticates with Google ID token and upserts new user', async () => {
    const googleOAuthService = createGoogleOAuthMock();
    const googleProfile = {
      googleId: 'google-1',
      email: 'jane@example.com',
      fullName: 'Jane Google',
      profileImageUrl: 'https://example.com/avatar.png',
      emailVerified: true,
    };

    googleOAuthService.verifyIdToken.mockResolvedValue(googleProfile);
    userModel.findOne
      .mockResolvedValueOnce(null) // lookup by googleUserId
      .mockResolvedValueOnce(null); // lookup by email

    const createdUser = {
      id: 'user-10',
      role: 'user',
      emailVerified: true,
    };

    userModel.create.mockResolvedValue(createdUser);

    const googleAuthService = new AuthService({
      userModel,
      tokenService,
      cloudinaryClient,
      config: {
        ...baseConfig,
        googleOAuth: { clientId: 'test-client' },
      },
      messagingHookService: messagingHooks,
      emailService,
      googleOAuthService,
    });

    const result = await googleAuthService.authenticateWithGoogleIdToken('token-xyz');

    expect(googleOAuthService.verifyIdToken).toHaveBeenCalledWith('token-xyz');
    expect(userModel.create).toHaveBeenCalledWith({
      fullName: 'Jane Google',
      email: 'jane@example.com',
      password: null,
      profileImageUrl: 'https://example.com/avatar.png',
      googleUserId: 'google-1',
      authMethod: 'google',
      emailVerified: true,
    });
    expect(messagingHooks.onUserEmailVerified).toHaveBeenCalledWith(createdUser);
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(emailService.sendEmailVerificationEmail).not.toHaveBeenCalled();
    expect(result.user).toBe(createdUser);
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
  });
});
