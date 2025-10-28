import Joi from 'joi';

const sanitizeString = Joi.string().trim().custom((value, helpers) => {
  const sanitized = value.replace(/[\u0000-\u001F\u007F]/g, '');
  if (sanitized !== value) {
    return helpers.error('string.invalid', { value: 'Invalid characters detected' });
  }
  return sanitized;
});

export const authSchemas = {
  register: {
    body: Joi.object({
      fullName: sanitizeString.min(2).max(100).required(),
      email: sanitizeString.email().required(),
      password: Joi.string().min(6).max(128).required(),
      phoneNumber: sanitizeString.allow('', null),
    }),
  },
  login: {
    body: Joi.object({
      email: sanitizeString.email().required(),
      password: Joi.string().min(6).required(),
    }),
  },
  refresh: {
    body: Joi.object({
      refreshToken: Joi.string().trim().required(),
    }),
  },
  requestPasswordReset: {
    body: Joi.object({
      email: sanitizeString.email().required(),
    }),
  },
  resetPassword: {
    body: Joi.object({
      email: sanitizeString.email().required(),
      token: sanitizeString.length(6).required(),
      newPassword: Joi.string().min(6).max(128).required(),
    }),
  },
  requestEmailVerification: {
    body: Joi.object({
      email: sanitizeString.email().required(),
    }),
  },
  verifyEmail: {
    body: Joi.object({
      email: sanitizeString.email().required(),
      token: sanitizeString.length(6).required(),
    }),
  },
  onboarding: {
    body: Joi.object({
      role: Joi.string().valid('user', 'host').required(),
      location: sanitizeString.min(2).max(120).required(),
      purposes: Joi.array().items(sanitizeString.max(80)).max(10).optional(),
    }),
  },
  googleIdToken: {
    body: Joi.object({
      idToken: sanitizeString.required(),
    }),
  },
  googleCode: {
    body: Joi.object({
      code: sanitizeString.required(),
      state: sanitizeString.allow('', null),
    }),
  },
  googleAuthUrl: {
    query: Joi.object({
      state: sanitizeString.allow('', null),
    }),
  },
};
