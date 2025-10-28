import rateLimit from 'express-rate-limit';
import { getConfig } from '../config/env.js';

const config = getConfig();

export const baseRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skip: () => config.nodeEnv === 'development',
  handler: (req, res) => {
    const requestId = res.locals.requestId;

    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
      requestId,
    });
  },
});
