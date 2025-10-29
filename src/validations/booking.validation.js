import Joi from 'joi';

const objectId = () =>
  Joi.string()
    .trim()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'must be a valid MongoDB ObjectId',
      'string.length': 'must be 24 characters long',
    });

const bookingStatuses = ['pending', 'upcoming', 'in_progress', 'completed', 'cancelled'];
const cancellationReasons = ['user_request', 'host_request', 'payment_timeout', 'system_error', 'other'];
const bookingTypes = ['hourly', 'daily', 'weekly', 'monthly'];

export const bookingIdParamSchema = {
  params: Joi.object({
    id: objectId().label('Booking ID'),
  }),
};

export const listBookingsQuerySchema = {
  query: Joi.object({
    status: Joi.string().valid(...bookingStatuses),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string()
      .valid('startTime', '-startTime', 'createdAt', '-createdAt')
      .default('startTime'),
  }),
};

export const createBookingSchema = {
  body: Joi.object({
    spaceId: objectId().label('Space ID'),
    startTime: Joi.date().iso().greater('now').required().messages({
      'date.greater': 'Start time must be in the future',
    }),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required().messages({
      'date.greater': 'End time must be after start time',
    }),
    guestCount: Joi.number().integer().min(1).max(100).default(1),
    bookingType: Joi.string().valid(...bookingTypes).default('hourly'),
    specialRequests: Joi.string().max(500).allow('').optional(),
    markupPercentage: Joi.number().min(0).max(100).default(15),
  }),
};

export const updateBookingStatusSchema = {
  ...bookingIdParamSchema,
  body: Joi.object({
    status: Joi.string()
      .valid('upcoming', 'in_progress', 'completed', 'cancelled')
      .required(),
    hostNotes: Joi.string().max(500).allow('').optional(),
    cancellationReason: Joi.string()
      .valid(...cancellationReasons)
      .when('status', {
        is: 'cancelled',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
  }),
};

export const cancelBookingSchema = {
  ...bookingIdParamSchema,
};

export const rescheduleBookingSchema = {
  ...bookingIdParamSchema,
  body: Joi.object({
    newStartTime: Joi.date().iso().greater('now').required().messages({
      'date.greater': 'New start time must be in the future',
    }),
    newEndTime: Joi.date().iso().greater(Joi.ref('newStartTime')).required().messages({
      'date.greater': 'New end time must be after the new start time',
    }),
    reason: Joi.string().max(500).allow('').optional(),
  }),
};
