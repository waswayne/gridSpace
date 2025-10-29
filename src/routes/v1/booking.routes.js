import { Router } from 'express';
import { authenticate, requireRoles } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate.js';
import { BookingRepository } from '../../repositories/booking.repository.js';
import { WorkspaceRepository } from '../../repositories/workspace.repository.js';
import { BookingService } from '../../services/booking.service.js';
import { BookingController } from '../../controllers/booking.controller.js';
import {
  createBookingSchema,
  listBookingsQuerySchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
} from '../../validations/booking.validation.js';
import { bookingMiddlewares } from '../../middlewares/booking.js';

const router = Router();

const bookingRepository = new BookingRepository();
const workspaceRepository = new WorkspaceRepository();
const bookingService = new BookingService({ bookingRepository, workspaceRepository });
const bookingController = new BookingController({ bookingService });

/**
 * @openapi
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: List bookings for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, upcoming, in_progress, completed, cancelled]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 10
 *     responses:
 *       200:
 *         description: List of user bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, validateRequest(listBookingsQuerySchema), bookingController.listUserBookings);

/**
 * @openapi
 * /bookings/host:
 *   get:
 *     tags: [Bookings]
 *     summary: List bookings across host-owned spaces
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, upcoming, in_progress, completed, cancelled]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Paginated host bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – requires host role
 */
router.get(
  '/host',
  authenticate,
  requireRoles('host', 'admin'),
  validateRequest(listBookingsQuerySchema),
  bookingController.listHostBookings
);

/**
 * @openapi
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking for a space
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingCreatePayload'
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Validation or conflict error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticate,
  validateRequest(createBookingSchema),
  bookingMiddlewares.createConflictGuard(),
  bookingMiddlewares.createDurationGuard(),
  bookingController.createBooking
);

/**
 * @openapi
 * /bookings/{id}/status:
 *   put:
 *     tags: [Bookings]
 *     summary: Update booking status as host
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingStatusUpdatePayload'
 *     responses:
 *       200:
 *         description: Booking status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Invalid transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – not the space owner
 */
router.put(
  '/:id/status',
  authenticate,
  requireRoles('host', 'admin'),
  bookingMiddlewares.createHostOwnershipGuard(),
  validateRequest(updateBookingStatusSchema),
  bookingController.updateStatus
);

/**
 * @openapi
 * /bookings/{id}/cancel:
 *   delete:
 *     tags: [Bookings]
 *     summary: Cancel an active booking as the guest user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Booking cannot be cancelled
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:id/cancel',
  authenticate,
  bookingMiddlewares.createUserOwnershipGuard(),
  validateRequest(cancelBookingSchema),
  bookingController.cancelBooking
);

/**
 * @openapi
 * /bookings/{id}/reschedule:
 *   post:
 *     tags: [Bookings]
 *     summary: Reschedule a booking to a new time range
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingReschedulePayload'
 *     responses:
 *       200:
 *         description: Booking rescheduled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Conflict or invalid timing
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:id/reschedule',
  authenticate,
  bookingMiddlewares.createUserOwnershipGuard(),
  validateRequest(rescheduleBookingSchema),
  bookingMiddlewares.createConflictGuard({ startField: 'newStartTime', endField: 'newEndTime' }),
  bookingMiddlewares.createDurationGuard(),
  bookingController.rescheduleBooking
);

export { router as bookingRouter };
