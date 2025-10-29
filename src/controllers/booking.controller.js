import { BookingService } from '../services/booking.service.js';

export class BookingController {
  constructor({ bookingService } = {}) {
    if (!bookingService) {
      throw new Error('BookingController requires a bookingService');
    }

    if (!(bookingService instanceof BookingService)) {
      throw new Error('bookingService must be an instance of BookingService');
    }

    this.bookingService = bookingService;

    this.listUserBookings = this.listUserBookings.bind(this);
    this.listHostBookings = this.listHostBookings.bind(this);
    this.createBooking = this.createBooking.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.cancelBooking = this.cancelBooking.bind(this);
    this.rescheduleBooking = this.rescheduleBooking.bind(this);
  }

  async listUserBookings(req, res, next) {
    try {
      const result = await this.bookingService.listUserBookings(req.user?._id, req.query);

      return res.status(200).json({
        success: true,
        message: 'Bookings retrieved successfully',
        data: {
          bookings: result.docs,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalBookings: result.totalDocs,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async listHostBookings(req, res, next) {
    try {
      const result = await this.bookingService.listHostBookings(req.user?._id, req.query);

      return res.status(200).json({
        success: true,
        message: 'Host bookings retrieved successfully',
        data: {
          bookings: result.docs,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalBookings: result.totalDocs,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async createBooking(req, res, next) {
    try {
      const booking = await this.bookingService.createBooking({
        userId: req.user?._id,
        payload: req.body,
      });

      return res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, hostNotes, cancellationReason } = req.body;

      const updated = await this.bookingService.updateBookingStatus({
        hostId: req.user?._id,
        bookingId: id,
        status,
        hostNotes,
        cancellationReason,
      });

      return res.status(200).json({
        success: true,
        message: `Booking ${status} successfully`,
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const { id } = req.params;

      const result = await this.bookingService.cancelBooking({
        userId: req.user?._id,
        bookingId: id,
      });

      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async rescheduleBooking(req, res, next) {
    try {
      const { id } = req.params;
      const { newStartTime, newEndTime, reason } = req.body;

      const booking = await this.bookingService.rescheduleBooking({
        userId: req.user?._id,
        bookingId: id,
        newStartTime,
        newEndTime,
        reason,
      });

      return res.status(200).json({
        success: true,
        message: 'Booking rescheduled successfully',
        data: booking,
      });
    } catch (error) {
      return next(error);
    }
  }
}
