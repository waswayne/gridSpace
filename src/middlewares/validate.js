export const validateRequest = (schema) => {
  return (req, res, next) => {
    const segments = ['params', 'query', 'body'];

    try {
      segments.forEach((segment) => {
        if (schema[segment]) {
          const { value, error } = schema[segment].validate(req[segment], {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
          });

          if (error) {
            throw error;
          }

          req[segment] = value;
        }
      });

      return next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.details?.map((detail) => detail.message) ?? [error.message],
        },
      });
    }
  };
};
