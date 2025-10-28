import { isAppError } from '../utils/errors.js';
import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  const requestId = res.locals.requestId;
  logger.error({ err, path: req.path, requestId }, 'Unhandled error');

  if (isAppError(err)) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      requestId,
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
    requestId,
  });
};
