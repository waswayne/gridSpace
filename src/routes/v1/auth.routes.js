import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller.js';
import { validateRequest } from '../../middlewares/validate.js';
import { authSchemas } from '../../validations/auth.validation.js';
import { upload } from '../../config/multer.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phoneNumber:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *             required:
 *               - fullName
 *               - email
 *               - password
 *     responses:
 *       '201':
 *         description: Registration successful
 *       '400':
 *         description: Validation error
 */
router.post(
  '/register',
  upload.single('profileImage'),
  validateRequest(authSchemas.register),
  authController.register
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate a user via email/password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Login successful
 *       '401':
 *         description: Invalid credentials
 */
router.post('/login', validateRequest(authSchemas.login), authController.login);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh JWT access token using a refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       '200':
 *         description: New tokens issued
 *       '401':
 *         description: Invalid refresh token
 */
router.post('/refresh', validateRequest(authSchemas.refresh), authController.refresh);

/**
 * @openapi
 * /api/v1/auth/password/reset/request:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       '200':
 *         description: OTP issued
 *       '400':
 *         description: Account not found
 *       '500':
 *         description: Email delivery failed (SMTP not configured)
 */
router.post(
  '/password/reset/request',
  validateRequest(authSchemas.requestPasswordReset),
  authController.requestPasswordReset
);

/**
 * @openapi
 * /api/v1/auth/password/reset:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *     responses:
 *       '200':
 *         description: Password updated and tokens rotated
 *       '400':
 *         description: Invalid or expired token
 */
router.post(
  '/password/reset',
  validateRequest(authSchemas.resetPassword),
  authController.resetPassword
);

/**
 * @openapi
 * /api/v1/auth/email/verify/request:
 *   post:
 *     tags: [Auth]
 *     summary: Request email verification OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       '200':
 *         description: Verification OTP sent
 *       '400':
 *         description: Account not found or already verified
 *       '500':
 *         description: Email delivery failed (SMTP not configured)
 */
router.post(
  '/email/verify/request',
  validateRequest(authSchemas.requestEmailVerification),
  authController.requestEmailVerification
);

/**
 * @openapi
 * /api/v1/auth/email/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify user email with OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *             required:
 *               - email
 *               - token
 *     responses:
 *       '200':
 *         description: Email verified
 *       '400':
 *         description: Invalid or expired token
 */
router.post(
  '/email/verify',
  validateRequest(authSchemas.verifyEmail),
  authController.verifyEmail
);

/**
 * @openapi
 * /api/v1/auth/onboarding:
 *   post:
 *     tags: [Auth]
 *     summary: Complete onboarding for a verified user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, host]
 *               location:
 *                 type: string
 *               purposes:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - role
 *               - location
 *     responses:
 *       '200':
 *         description: Onboarding completed
 *       '400':
 *         description: Validation error or email not verified
 *       '401':
 *         description: Unauthorized
 */
router.post(
  '/onboarding',
  authenticate,
  validateRequest(authSchemas.onboarding),
  authController.completeOnboarding
);

/**
 * @openapi
 * /api/v1/auth/google/url:
 *   get:
 *     tags: [Auth]
 *     summary: Generate Google OAuth authorization URL
 *     parameters:
 *       - in: query
 *         name: state
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional opaque value passed back after OAuth flow
 *     responses:
 *       '200':
 *         description: Authorization URL generated
 *       '400':
 *         description: Google OAuth not configured
 */
router.get('/google/url', validateRequest(authSchemas.googleAuthUrl), authController.googleAuthUrl);

/**
 * @openapi
 * /api/v1/auth/google/id-token:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in with Google ID token (client-side flow)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *             required:
 *               - idToken
 *     responses:
 *       '200':
 *         description: |
 *           Google sign-in successful. Returns user profile and JWT tokens.
 *           New accounts will have `onboardingCompleted: false` until `/auth/onboarding`
 *           is called with role (`user` or `host`) and location details.
 *       '400':
 *         description: Invalid Google token or misconfiguration
 */
router.post(
  '/google/id-token',
  validateRequest(authSchemas.googleIdToken),
  authController.googleSignInWithIdToken
);

/**
 * @openapi
 * /api/v1/auth/google/code:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange Google authorization code for session tokens (server-side flow)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               state:
 *                 type: string
 *             required:
 *               - code
 *     responses:
 *       '200':
 *         description: |
 *           Google OAuth exchange successful. Returns user profile and JWT tokens.
 *           Call `/auth/onboarding` next with role (`user` or `host`) to finish setup
 *           if `onboardingCompleted` is false.
 *       '400':
 *         description: Invalid authorization code or misconfiguration
 */
router.post(
  '/google/code',
  validateRequest(authSchemas.googleCode),
  authController.googleSignInWithCode
);

export { router as authRouter };
