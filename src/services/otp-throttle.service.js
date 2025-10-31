import { OtpThrottleModel } from '../models/otp-throttle.model.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../config/logger.js';

const ONE_HOUR_MS = 60 * 60 * 1000;
const DEFAULT_EXPIRY_MS = ONE_HOUR_MS * 2;

const buildRetryError = (retryAt) =>
  new AppError('Please wait before requesting another one-time code', {
    statusCode: 429,
    code: 'OTP_RATE_LIMITED',
    details: { retryAt },
  });

export class OtpThrottleService {
  constructor({ throttleModel = OtpThrottleModel } = {}) {
    this.throttleModel = throttleModel;
  }

  async assertCanSend({ email, type, cooldownSeconds = 60, maxPerHour = 5 }) {
    if (!email || !type) {
      throw new AppError('Email and type are required for OTP throttling', {
        statusCode: 500,
      });
    }

    const now = new Date();
    const cooldownMs = Math.max(cooldownSeconds, 0) * 1000;
    const hourlyLimit = Math.max(maxPerHour, 1);

    let record = await this.throttleModel.findOne({ email, type });

    if (!record) {
      record = await this.throttleModel.create({
        email,
        type,
        requestCount: 1,
        windowStartedAt: now,
        nextAllowedAt: new Date(now.getTime() + cooldownMs),
        expiresAt: new Date(now.getTime() + DEFAULT_EXPIRY_MS),
      });

      logger.debug('OTP throttle record created', {
        email,
        type,
        nextAllowedAt: record.nextAllowedAt,
      });
      return;
    }

    if (record.nextAllowedAt && record.nextAllowedAt > now) {
      logger.warn('OTP throttle cooldown active', {
        email,
        type,
        retryAt: record.nextAllowedAt,
      });
      throw buildRetryError(record.nextAllowedAt);
    }

    let requestCount = record.requestCount ?? 0;
    let windowStartedAt = record.windowStartedAt ?? now;

    if (now.getTime() - windowStartedAt.getTime() >= ONE_HOUR_MS) {
      requestCount = 0;
      windowStartedAt = now;
    }

    if (requestCount >= hourlyLimit) {
      const retryAt = new Date(windowStartedAt.getTime() + ONE_HOUR_MS);
      logger.warn('OTP throttle hourly limit reached', {
        email,
        type,
        retryAt,
      });
      throw buildRetryError(retryAt);
    }

    record.requestCount = requestCount + 1;
    record.windowStartedAt = windowStartedAt;
    record.nextAllowedAt = new Date(now.getTime() + cooldownMs);
    record.expiresAt = new Date(
      Math.max(record.nextAllowedAt.getTime(), windowStartedAt.getTime() + ONE_HOUR_MS)
    );

    await record.save();

    logger.debug('OTP throttle state updated', {
      email,
      type,
      nextAllowedAt: record.nextAllowedAt,
      requestCount: record.requestCount,
    });
  }
}
