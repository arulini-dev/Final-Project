import express from 'express';
import {
  // Dashboard
  getDashboard,

  // User management
  getUsers,
  getUser,
  updateUser,
  deleteUser,

  // Vendor management
  getVendors,
  updateVendorStatus,

  // Event management
  getEvents,
  createEvent,
  updateEvent,
  updateEventStatus,

  // Booking management
  getBookings,
  updateBookingStatus,

  // Payment management
  getPayments,

  // Review management
  getReviews,
  updateReviewStatus,
  deleteReview,

  // Chat management
  getMessages,
  deleteMessage,

  // Category management
  getCategories,
  createCategory,
  deleteCategory,} from './admin.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import validate from '../../middleware/validate.js';
import {
  getUsersQuerySchema,
  userIdParamsSchema,
  updateUserSchema,
  getVendorsQuerySchema,
  vendorIdParamsSchema,
  updateVendorStatusSchema,
  getAdminEventsQuerySchema,
  eventIdParamsSchema,
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema,
  createCategorySchema,
  categoryIdParamsSchema,
  getBookingsQuerySchema,
  bookingIdParamsSchema,
  updateBookingStatusSchema,
  getPaymentsQuerySchema,
  getReviewsQuerySchema,
  reviewIdParamsSchema,
  updateReviewStatusSchema,
  getMessagesQuerySchema,
  messageIdParamsSchema
} from './admin.validation.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// ===== DASHBOARD =====
router.get('/dashboard', getDashboard);

// ===== USER MANAGEMENT =====
router.get('/users', validate(getUsersQuerySchema), getUsers);
router.get('/users/:id', validate(userIdParamsSchema), getUser);
router.put('/users/:id', validate(userIdParamsSchema), validate(updateUserSchema), updateUser);
router.delete('/users/:id', validate(userIdParamsSchema), deleteUser);

// ===== VENDOR MANAGEMENT =====
router.get('/vendors', validate(getVendorsQuerySchema), getVendors);
router.put('/vendors/:id/status', validate(vendorIdParamsSchema), validate(updateVendorStatusSchema), updateVendorStatus);

// ===== EVENT MANAGEMENT =====
router.get('/events', validate(getAdminEventsQuerySchema), getEvents);
router.post('/events', validate(createEventSchema), createEvent);
router.put('/events/:id', validate(eventIdParamsSchema), validate(updateEventSchema), updateEvent);
router.put('/events/:id/status', validate(eventIdParamsSchema), validate(updateEventStatusSchema), updateEventStatus);

// ===== BOOKING MANAGEMENT =====
router.get('/bookings', validate(getBookingsQuerySchema), getBookings);
router.put('/bookings/:id/status', validate(bookingIdParamsSchema), validate(updateBookingStatusSchema), updateBookingStatus);

// ===== PAYMENT MANAGEMENT =====
router.get('/payments', validate(getPaymentsQuerySchema), getPayments);

// ===== REVIEW MANAGEMENT =====
router.get('/reviews', validate(getReviewsQuerySchema), getReviews);
router.put('/reviews/:id/status', validate(reviewIdParamsSchema), validate(updateReviewStatusSchema), updateReviewStatus);
router.delete('/reviews/:id', validate(reviewIdParamsSchema), deleteReview);

// ===== CHAT MANAGEMENT =====
router.get('/chats', validate(getMessagesQuerySchema), getMessages);
router.delete('/chats/:id', validate(messageIdParamsSchema), deleteMessage);

// ===== CATEGORY MANAGEMENT =====
router.get('/categories', getCategories);
router.post('/categories', validate(createCategorySchema), createCategory);
router.delete('/categories/:id', validate(categoryIdParamsSchema), deleteCategory);

export default router;