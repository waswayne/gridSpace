import { isAppError } from "../utils/errors.js";
import { logger } from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
  const requestId = res.locals.requestId;
  logger.error({ err, path: req.path, requestId }, "Unhandled error");

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

  // Handle Multer errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message:
          err.code === "LIMIT_FILE_SIZE"
            ? "File too large. Maximum allowed size is 5MB"
            : err.message,
      },
      requestId,
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred. Please try again later.",
    },
    requestId,
  });
};
