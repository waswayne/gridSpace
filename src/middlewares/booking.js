import { BookingRepository } from '../repositories/booking.repository.js';
import { WorkspaceRepository } from '../repositories/workspace.repository.js';
import { BadRequestError, ForbiddenError } from '../utils/errors.js';

const DEFAULT_ERROR_HANDLER = (error, req, res, next) => next(error);

const ensureDate = (value, fieldName) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.valueOf())) {
    throw new BadRequestError(`${fieldName} must be a valid ISO date string`);
  }

  return date;
};

export class BookingMiddlewareFactory {
  constructor({ bookingRepository, workspaceRepository } = {}) {
    this.bookingRepository = bookingRepository ?? new BookingRepository();
    this.workspaceRepository = workspaceRepository ?? new WorkspaceRepository();
  }

  createConflictGuard({
    startField = 'startTime',
    endField = 'endTime',
    allowPast = false,
    errorHandler = DEFAULT_ERROR_HANDLER,
  } = {}) {
    return async (req, res, next) => {
      try {
        const rawSpaceId =
          req.body?.spaceId ??
          req.booking?.spaceId?._id ??
          req.booking?.spaceId ??
          req.params?.spaceId;

        const startRaw = req.body?.[startField];
        const endRaw = req.body?.[endField];
        const excludeBookingId = req.params?.id;

        if (!rawSpaceId || !startRaw || !endRaw) {
          throw new BadRequestError('Space ID, start time, and end time are required');
        }

        const start = ensureDate(startRaw, 'Start time');
        const end = ensureDate(endRaw, 'End time');

        if (start >= end) {
          throw new BadRequestError('End time must be after start time');
        }

        if (!allowPast && start < new Date()) {
          throw new BadRequestError('Cannot create bookings in the past');
        }

        const hasConflict = await this.bookingRepository.hasActiveConflict({
          spaceId: rawSpaceId,
          startTime: start,
          endTime: end,
          excludeBookingId,
        });

        if (hasConflict) {
          throw new BadRequestError('The selected time slot is already booked');
        }

        req.bookingTiming = { start, end };
        return next();
      } catch (error) {
        return errorHandler(error, req, res, next);
      }
    };
  }

  createDurationGuard({ minimumHours = 1, maximumHours = 24, errorHandler = DEFAULT_ERROR_HANDLER } = {}) {
    return (req, res, next) => {
      try {
        const { start, end } = req.bookingTiming ?? {};
        if (!start || !end) {
          throw new BadRequestError('Booking timing context not available');
        }

        const durationHours = (end - start) / (1000 * 60 * 60);

        if (durationHours < minimumHours) {
          throw new BadRequestError(`Minimum booking duration is ${minimumHours} hour(s)`);
        }

        if (durationHours > maximumHours) {
          throw new BadRequestError(`Maximum booking duration is ${maximumHours} hour(s)`);
        }

        req.bookingDurationHours = durationHours;
        return next();
      } catch (error) {
        return errorHandler(error, req, res, next);
      }
    };
  }

  createHostOwnershipGuard({ errorHandler = DEFAULT_ERROR_HANDLER } = {}) {
    return async (req, res, next) => {
      try {
        const hostId = req.user?._id;
        const { id: bookingId } = req.params;

        if (!hostId || !bookingId) {
          throw new BadRequestError('Host authentication or booking ID missing');
        }

        const booking = await this.bookingRepository.findById(bookingId, {
          populateSpace: 'hostId',
          lean: true,
        });

        if (!booking) {
          throw new BadRequestError('Booking not found');
        }

        if (String(booking.spaceId?.hostId ?? booking.spaceId) !== String(hostId)) {
          throw new ForbiddenError("You don't have permission to modify this booking");
        }

        req.booking = booking;
        return next();
      } catch (error) {
        return errorHandler(error, req, res, next);
      }
    };
  }

  createUserOwnershipGuard({ errorHandler = DEFAULT_ERROR_HANDLER } = {}) {
    return async (req, res, next) => {
      try {
        const userId = req.user?._id;
        const { id: bookingId } = req.params;

        if (!userId || !bookingId) {
          throw new BadRequestError('User authentication or booking ID missing');
        }

        const booking = await this.bookingRepository.findById(bookingId, {
          lean: true,
        });

        if (!booking) {
          throw new BadRequestError('Booking not found');
        }

        if (String(booking.userId) !== String(userId)) {
          throw new ForbiddenError("You don't have permission to modify this booking");
        }

        req.booking = booking;
        return next();
      } catch (error) {
        return errorHandler(error, req, res, next);
      }
    };
  }
}

export const bookingMiddlewares = new BookingMiddlewareFactory({});

