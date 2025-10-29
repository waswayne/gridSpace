import { BadRequestError, ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { BookingRepository } from '../repositories/booking.repository.js';
import { WorkspaceRepository } from '../repositories/workspace.repository.js';
import { logger } from '../config/logger.js';

const VALID_STATUS_TRANSITIONS = {
  pending: ['upcoming', 'cancelled'],
  upcoming: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
};

const REFUND_TIERS = [
  { minHours: 48, refundRate: 1, code: 'full_refund_48h' },
  { minHours: 2, refundRate: 0.5, code: 'partial_refund_50p' },
];

export class BookingService {
  constructor({
    bookingRepository = new BookingRepository(),
    workspaceRepository = new WorkspaceRepository(),
    log = logger,
  } = {}) {
    this.bookingRepository = bookingRepository;
    this.workspaceRepository = workspaceRepository;
    this.logger = log;
  }

  async listUserBookings(userId, query = {}) {
    if (!userId) {
      throw new UnauthorizedError('Authentication required to list bookings');
    }

    return this.bookingRepository.paginateUserBookings(userId, query);
  }

  async listHostBookings(hostId, query = {}) {
    if (!hostId) {
      throw new UnauthorizedError('Authentication required to list host bookings');
    }

    const spaceIds = await this.workspaceRepository.listActiveIdsByHost(hostId);

    if (!spaceIds.length) {
      return {
        docs: [],
        totalDocs: 0,
        limit: query.limit ?? 10,
        page: query.page ?? 1,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      };
    }

    return this.bookingRepository.paginateHostBookings(spaceIds, query);
  }

  async createBooking({ userId, payload }) {
    if (!userId) {
      throw new UnauthorizedError('Authentication required to create bookings');
    }

    if (!payload?.spaceId) {
      throw new BadRequestError('Space ID is required to create a booking');
    }

    const {
      spaceId,
      startTime,
      endTime,
      guestCount,
      bookingType = 'hourly',
      specialRequests = '',
      markupPercentage = 15,
    } = payload;

    const space = await this.workspaceRepository.findActiveById(spaceId, {
      lean: true,
      populateHost: true,
    });

    if (!space) {
      throw new BadRequestError('Space not found or inactive');
    }

    if (space.capacity && guestCount > space.capacity) {
      throw new BadRequestError(`Space capacity is ${space.capacity}. Reduce guest count.`);
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
      throw new BadRequestError('Invalid date format for start or end time');
    }

    if (start >= end) {
      throw new BadRequestError('End time must be after start time');
    }

    const hasConflict = await this.bookingRepository.hasActiveConflict({
      spaceId,
      startTime: start,
      endTime: end,
    });

    if (hasConflict) {
      throw new BadRequestError('The selected time slot is already booked');
    }

    const bookingData = {
      userId,
      spaceId,
      startTime: start,
      endTime: end,
      guestCount,
      bookingType,
      specialRequests,
      markupPercentage,
      basePrice: space.pricePerHour,
    };

    return this.bookingRepository.create(bookingData);
  }

  async updateBookingStatus({ hostId, bookingId, status, hostNotes, cancellationReason }) {
    if (!hostId) {
      throw new UnauthorizedError('Authentication required to update booking status');
    }

    const booking = await this.bookingRepository.findById(bookingId, {
      populateSpace: 'hostId title',
      lean: true,
    });

    if (!booking) {
      throw new BadRequestError('Booking not found');
    }

    if (String(booking.spaceId?.hostId ?? booking.spaceId) !== String(hostId)) {
      throw new ForbiddenError("You do not have permission to update this booking");
    }

    const currentStatus = booking.status;
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] ?? [];

    if (!allowedTransitions.includes(status)) {
      throw new BadRequestError(`Cannot transition booking from ${currentStatus} to ${status}`);
    }

    const update = { status, hostNotes };

    if (status === 'cancelled') {
      const cancellationInfo = {
        cancelledBy: hostId,
        reason: cancellationReason ?? 'host_request',
        notes: hostNotes ?? undefined,
      };

      if (booking.paymentStatus === 'paid') {
        cancellationInfo.refundAmount = booking.totalAmount;
        update.paymentStatus = 'refunded';
      }

      return this.bookingRepository.recordCancellation(bookingId, cancellationInfo, {
        paymentStatus: update.paymentStatus,
      });
    }

    if (status === 'in_progress' && !this.#isWithinRange(new Date(), booking.startTime, booking.endTime)) {
      throw new BadRequestError('Booking cannot be marked in progress outside its scheduled window');
    }

    return this.bookingRepository.updateById(bookingId, update);
  }

  async cancelBooking({ userId, bookingId }) {
    if (!userId) {
      throw new UnauthorizedError('Authentication required to cancel bookings');
    }

    const booking = await this.bookingRepository.findById(bookingId, {
      lean: true,
    });

    if (!booking || String(booking.userId) !== String(userId)) {
      throw new ForbiddenError('Booking not found for the requesting user');
    }

    if (!['pending', 'upcoming'].includes(booking.status)) {
      throw new BadRequestError(`Cannot cancel booking in status ${booking.status}`);
    }

    const hoursUntilStart = (new Date(booking.startTime) - new Date()) / (1000 * 60 * 60);
    if (hoursUntilStart < 0) {
      throw new BadRequestError('Cannot cancel a booking that has already started');
    }

    const { refundAmount, refundType } = this.#calculateRefund(booking.totalAmount, hoursUntilStart);

    return this.bookingRepository.recordCancellation(
      bookingId,
      {
        cancelledBy: userId,
        reason: 'user_request',
        refundAmount,
      },
      {
        paymentStatus:
          refundAmount === 0
            ? booking.paymentStatus
            : refundAmount === booking.totalAmount
              ? 'refunded'
              : 'partially_refunded',
      }
    ).then((updated) => ({
      booking: updated,
      refund: {
        amount: refundAmount,
        type: refundType,
      },
    }));
  }

  async rescheduleBooking({ userId, bookingId, newStartTime, newEndTime, reason }) {
    if (!userId) {
      throw new UnauthorizedError('Authentication required to reschedule bookings');
    }

    const booking = await this.bookingRepository.findById(bookingId, {
      populateSpace: 'hostId pricePerHour',
      lean: true,
    });

    if (!booking || String(booking.userId) !== String(userId)) {
      throw new ForbiddenError('Booking not found for the requesting user');
    }

    if (!booking.canReschedule) {
      throw new BadRequestError('Booking cannot be rescheduled this close to the start time');
    }

    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);

    if (Number.isNaN(newStart.valueOf()) || Number.isNaN(newEnd.valueOf())) {
      throw new BadRequestError('Invalid date format for reschedule');
    }

    if (newStart >= newEnd) {
      throw new BadRequestError('New end time must be after new start time');
    }

    const hasConflict = await this.bookingRepository.hasActiveConflict({
      spaceId: booking.spaceId?._id ?? booking.spaceId,
      startTime: newStart,
      endTime: newEnd,
      excludeBookingId: bookingId,
    });

    if (hasConflict) {
      throw new BadRequestError('The selected time slot is already booked');
    }

    const updated = await this.bookingRepository.appendRescheduleHistory(
      bookingId,
      {
        originalStart: booking.startTime,
        originalEnd: booking.endTime,
        newStart,
        newEnd,
        rescheduledBy: userId,
        reason,
      },
      {
        setFields: {
          startTime: newStart,
          endTime: newEnd,
        },
      }
    );

    return updated;
  }

  async expirePendingBookings({ olderThanMinutes = 5 } = {}) {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    const modifiedCount = await this.bookingRepository.expirePending({ cutoff });

    this.logger.info('Expired pending bookings', {
      olderThanMinutes,
      modifiedCount,
    });

    return modifiedCount;
  }

  #calculateRefund(totalAmount, hoursUntilStart) {
    const tier = REFUND_TIERS.find(({ minHours }) => hoursUntilStart >= minHours);

    if (!tier) {
      return { refundAmount: 0, refundType: 'none' };
    }

    return {
      refundAmount: Math.floor(totalAmount * tier.refundRate),
      refundType: tier.code,
    };
  }

  #isWithinRange(now, start, end) {
    const current = now instanceof Date ? now : new Date(now);
    return current >= new Date(start) && current <= new Date(end);
  }
}
