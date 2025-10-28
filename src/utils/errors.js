export class AppError extends Error {
  constructor(message, { statusCode = 500, code = 'INTERNAL_ERROR', details = null } = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const isAppError = (err) => err instanceof AppError;

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details) {
    super(message, { statusCode: 400, code: 'BAD_REQUEST', details });
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details) {
    super(message, { statusCode: 401, code: 'UNAUTHORIZED', details });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details) {
    super(message, { statusCode: 403, code: 'FORBIDDEN', details });
    this.name = 'ForbiddenError';
  }
}

export class NotImplementedError extends AppError {
  constructor(message = 'This functionality has not been implemented yet.') {
    super(message, { statusCode: 501, code: 'NOT_IMPLEMENTED' });
    this.name = 'NotImplementedError';
  }
}
