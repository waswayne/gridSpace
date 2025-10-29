import { BookingModel } from '../models/booking.model.js';

const DEFAULT_LEAN_OPTIONS = { getters: true, virtuals: true };
const DEFAULT_PAGINATE_OPTIONS = {
  page: 1,
  limit: 10,
  sort: { startTime: 1 },
  lean: true,
  leanWithId: true,
  leanOptions: DEFAULT_LEAN_OPTIONS,
};
const HOST_PAGINATE_OPTIONS = {
  page: 1,
  limit: 10,
  sort: { startTime: 1 },
  lean: true,
  leanWithId: true,
  leanOptions: DEFAULT_LEAN_OPTIONS,
};

const CONFLICT_STATUSES = ['pending', 'upcoming', 'in_progress'];

const ensureArray = (value) => (Array.isArray(value) ? value : []);

export class BookingRepository {
  constructor({ bookingModel = BookingModel } = {}) {
    if (!bookingModel) {
      throw new Error('BookingRepository requires a bookingModel');
    }

    this.bookingModel = bookingModel;
  }

  async create(bookingData) {
    const booking = await this.bookingModel.create(bookingData);
    return booking.toObject ? booking.toObject() : booking;
  }

  async findById(id, { lean = true, populateSpace = false, populateUser = false } = {}) {
    if (!id) {
      throw new Error('BookingRepository.findById requires an id');
    }

    let query = this.bookingModel.findById(id);

    if (populateSpace) {
      const selection = typeof populateSpace === 'string' ? populateSpace : 'title location images amenities capacity hostId';
      query = query.populate('spaceId', selection);
    }

    if (populateUser) {
      const selection = typeof populateUser === 'string' ? populateUser : 'fullname email profilePic';
      query = query.populate('userId', selection);
    }

    if (lean) {
      query = query.lean(DEFAULT_LEAN_OPTIONS);
    }

    return query.exec();
  }

  async paginateUserBookings(userId, { status, page, limit, sort } = {}) {
    if (!userId) {
      throw new Error('BookingRepository.paginateUserBookings requires a userId');
    }

    const filter = {
      userId,
      isActive: true,
    };

    if (status) {
      filter.status = status;
    }

    const options = {
      ...DEFAULT_PAGINATE_OPTIONS,
      ...(page ? { page } : {}),
      ...(limit ? { limit } : {}),
      ...(sort ? { sort } : {}),
      populate: {
        path: 'spaceId',
        select: 'title location images amenities capacity pricePerHour',
      },
    };

    return this.bookingModel.paginate(filter, options);
  }

  async paginateHostBookings(spaceIds, { status, page, limit, sort } = {}) {
    const ids = ensureArray(spaceIds).filter(Boolean);
    if (!ids.length) {
      throw new Error('BookingRepository.paginateHostBookings requires at least one spaceId');
    }

    const filter = {
      spaceId: { $in: ids },
      isActive: true,
    };

    if (status) {
      filter.status = status;
    }

    const options = {
      ...HOST_PAGINATE_OPTIONS,
      ...(page ? { page } : {}),
      ...(limit ? { limit } : {}),
      ...(sort ? { sort } : {}),
      populate: [
        {
          path: 'spaceId',
          select: 'title location hostId',
        },
        {
          path: 'userId',
          select: 'fullname email profilePic',
        },
      ],
    };

    return this.bookingModel.paginate(filter, options);
  }

  async updateById(id, update, { lean = true, runValidators = true } = {}) {
    if (!id) {
      throw new Error('BookingRepository.updateById requires an id');
    }

    const query = this.bookingModel
      .findByIdAndUpdate(
        id,
        { ...update, updatedAt: new Date() },
        { new: true, runValidators }
      );

    if (lean) {
      query.lean(DEFAULT_LEAN_OPTIONS);
    }

    return query.exec();
  }

  async appendRescheduleHistory(id, historyEntry, { setFields = {}, lean = true } = {}) {
    if (!id) {
      throw new Error('BookingRepository.appendRescheduleHistory requires an id');
    }

    const entry = {
      ...historyEntry,
      rescheduledAt: historyEntry?.rescheduledAt ?? new Date(),
    };

    const update = {
      $push: { rescheduleHistory: entry },
      $set: { ...setFields, updatedAt: new Date() },
    };

    const query = this.bookingModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (lean) {
      query.lean(DEFAULT_LEAN_OPTIONS);
    }

    return query.exec();
  }

  async recordCancellation(id, cancellationInfo, { paymentStatus, status = 'cancelled', lean = true } = {}) {
    if (!id) {
      throw new Error('BookingRepository.recordCancellation requires an id');
    }

    const info = {
      ...cancellationInfo,
      cancelledAt: cancellationInfo?.cancelledAt ?? new Date(),
    };

    const update = {
      status,
      cancellationInfo: info,
    };

    if (paymentStatus) {
      update.paymentStatus = paymentStatus;
    }

    return this.updateById(id, update, { lean });
  }

  async softDelete(id, { lean = true } = {}) {
    return this.updateById(id, { isActive: false }, { lean });
  }

  async hasActiveConflict({ spaceId, startTime, endTime, excludeBookingId } = {}) {
    if (!spaceId || !startTime || !endTime) {
      throw new Error('BookingRepository.hasActiveConflict requires spaceId, startTime, and endTime');
    }

    const filter = {
      spaceId,
      isActive: true,
      status: { $in: CONFLICT_STATUSES },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    };

    if (excludeBookingId) {
      filter._id = { $ne: excludeBookingId };
    }

    const conflict = await this.bookingModel.exists(filter);
    return Boolean(conflict);
  }

  async expirePending({ cutoff, status = 'pending' } = {}) {
    if (!cutoff) {
      throw new Error('BookingRepository.expirePending requires a cutoff date');
    }

    const result = await this.bookingModel.updateMany(
      {
        status,
        createdAt: { $lt: cutoff },
      },
      {
        status: 'cancelled',
        cancellationInfo: {
          reason: 'payment_timeout',
          cancelledAt: new Date(),
        },
      }
    );

    return result.modifiedCount ?? 0;
  }
}
