import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BookingService } from '../../src/services/booking.service.js';
import { BadRequestError, ForbiddenError } from '../../src/utils/errors.js';

const createBookingRepositoryMock = () => ({
  paginateUserBookings: vi.fn(),
  paginateHostBookings: vi.fn(),
  listActiveIdsByHost: vi.fn(),
  hasActiveConflict: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  recordCancellation: vi.fn(),
  updateById: vi.fn(),
  appendRescheduleHistory: vi.fn(),
  expirePending: vi.fn(),
});

const createWorkspaceRepositoryMock = () => ({
  listActiveIdsByHost: vi.fn(),
  findActiveById: vi.fn(),
});

describe('BookingService', () => {
  let bookingRepository;
  let workspaceRepository;
  let service;

  beforeEach(() => {
    bookingRepository = createBookingRepositoryMock();
    workspaceRepository = createWorkspaceRepositoryMock();
    service = new BookingService({ bookingRepository, workspaceRepository });
  });

  it('lists host bookings and returns empty pagination when host has no spaces', async () => {
    workspaceRepository.listActiveIdsByHost.mockResolvedValue([]);

    const result = await service.listHostBookings('host-1', { page: 2, limit: 5 });

    expect(result.docs).toEqual([]);
    expect(result.totalDocs).toBe(0);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(bookingRepository.paginateHostBookings).not.toHaveBeenCalled();
  });

  it('creates a booking when input is valid', async () => {
    const now = Date.now();
    const startTime = new Date(now + 60 * 60 * 1000).toISOString();
    const endTime = new Date(now + 2 * 60 * 60 * 1000).toISOString();

    workspaceRepository.findActiveById.mockResolvedValue({
      _id: 'space-1',
      pricePerHour: 5000,
      capacity: 10,
    });
    bookingRepository.hasActiveConflict.mockResolvedValue(false);
    bookingRepository.create.mockResolvedValue({ _id: 'booking-1' });

    const booking = await service.createBooking({
      userId: 'user-1',
      payload: {
        spaceId: 'space-1',
        startTime,
        endTime,
        guestCount: 4,
        bookingType: 'hourly',
        specialRequests: 'Window seat',
      },
    });

    expect(bookingRepository.hasActiveConflict).toHaveBeenCalledWith({
      spaceId: 'space-1',
      startTime: expect.any(Date),
      endTime: expect.any(Date),
    });
    expect(bookingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        spaceId: 'space-1',
        guestCount: 4,
        bookingType: 'hourly',
        basePrice: 5000,
        specialRequests: 'Window seat',
      })
    );
    expect(booking).toEqual({ _id: 'booking-1' });
  });

  it('throws when creating booking with conflicting slot', async () => {
    const now = Date.now();
    workspaceRepository.findActiveById.mockResolvedValue({ _id: 'space-1', pricePerHour: 4000, capacity: 6 });
    bookingRepository.hasActiveConflict.mockResolvedValue(true);

    await expect(
      service.createBooking({
        userId: 'user-1',
        payload: {
          spaceId: 'space-1',
          startTime: new Date(now + 3600000).toISOString(),
          endTime: new Date(now + 7200000).toISOString(),
          guestCount: 2,
        },
      })
    ).rejects.toThrow(BadRequestError);
  });

  it('cancels booking and returns refund information', async () => {
    bookingRepository.findById.mockResolvedValue({
      _id: 'booking-1',
      userId: 'user-1',
      status: 'upcoming',
      startTime: new Date(Date.now() + 50 * 60 * 60 * 1000),
      totalAmount: 10000,
      paymentStatus: 'paid',
    });
    bookingRepository.recordCancellation.mockResolvedValue({
      _id: 'booking-1',
      status: 'cancelled',
      paymentStatus: 'refunded',
    });

    const result = await service.cancelBooking({ userId: 'user-1', bookingId: 'booking-1' });

    expect(bookingRepository.recordCancellation).toHaveBeenCalledWith(
      'booking-1',
      expect.objectContaining({
        cancelledBy: 'user-1',
        refundAmount: 10000,
      }),
      expect.objectContaining({ paymentStatus: 'refunded' })
    );
    expect(result.refund).toEqual({ amount: 10000, type: 'full_refund_48h' });
  });

  it('throws forbidden error when user tries to cancel booking they do not own', async () => {
    bookingRepository.findById.mockResolvedValue({ _id: 'booking', userId: 'someone-else' });

    await expect(service.cancelBooking({ userId: 'user-1', bookingId: 'booking' })).rejects.toThrow(ForbiddenError);
  });

  it('reschedules booking after conflict check', async () => {
    const originalStart = new Date(Date.now() + 10 * 60 * 60 * 1000);
    const originalEnd = new Date(Date.now() + 12 * 60 * 60 * 1000);

    bookingRepository.findById.mockResolvedValue({
      _id: 'booking-1',
      userId: 'user-1',
      status: 'upcoming',
      startTime: originalStart,
      endTime: originalEnd,
      spaceId: 'space-1',
      canReschedule: true,
    });
    bookingRepository.hasActiveConflict.mockResolvedValue(false);
    bookingRepository.appendRescheduleHistory.mockResolvedValue({ _id: 'booking-1', status: 'upcoming' });

    const newStart = new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString();
    const newEnd = new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString();

    const result = await service.rescheduleBooking({
      userId: 'user-1',
      bookingId: 'booking-1',
      newStartTime: newStart,
      newEndTime: newEnd,
      reason: 'Need later time',
    });

    expect(bookingRepository.hasActiveConflict).toHaveBeenCalledWith(
      expect.objectContaining({
        spaceId: 'space-1',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        excludeBookingId: 'booking-1',
      })
    );
    expect(bookingRepository.appendRescheduleHistory).toHaveBeenCalledWith(
      'booking-1',
      expect.objectContaining({
        newStart: expect.any(Date),
        newEnd: expect.any(Date),
        rescheduledBy: 'user-1',
      }),
      expect.objectContaining({
        setFields: {
          startTime: expect.any(Date),
          endTime: expect.any(Date),
        },
      })
    );
    expect(result).toEqual({ _id: 'booking-1', status: 'upcoming' });
  });
});
