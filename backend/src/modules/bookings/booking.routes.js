import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  checkVenueAvailability,
  getAvailableSlots,
  getAllBookings,
  updateBookingStatus,
  getBookingStats,
  getBookingAdmin
} from './booking.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import {
  validate,
  createBookingSchema,
  getUserBookingsQuerySchema,
  getBookingParamsSchema,
  updateBookingSchema,
  cancelBookingParamsSchema,
  checkVenueAvailabilitySchema,
  getAvailableSlotsQuerySchema,
  getAllBookingsQuerySchema,
  updateBookingStatusSchema,
  getBookingAdminParamsSchema
} from './booking.validation.js';

const router = express.Router();

// Public routes
router.get('/availability', validate(getAvailableSlotsQuerySchema), getAvailableSlots);

// All other routes require authentication
router.use(protect);

// User routes
router.post('/', validate(createBookingSchema), createBooking);
router.get('/my-bookings', validate(getUserBookingsQuerySchema), getUserBookings);
router.get('/:id', validate(getBookingParamsSchema), getBooking);
router.put('/:id', validate(updateBookingSchema), updateBooking);
router.put('/:id/cancel', validate(cancelBookingParamsSchema), cancelBooking);

// Venue availability check
router.post('/check-availability', validate(checkVenueAvailabilitySchema), checkVenueAvailability);

// Admin routes
router.get('/admin/all', authorize('admin'), validate(getAllBookingsQuerySchema), getAllBookings);
router.get('/admin/stats', authorize('admin'), getBookingStats);
router.get('/admin/:id', authorize('admin'), validate(getBookingAdminParamsSchema), getBookingAdmin);
router.put('/admin/:id/status', authorize('admin'), validate(updateBookingStatusSchema), updateBookingStatus);

export default router;