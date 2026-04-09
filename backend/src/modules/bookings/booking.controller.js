import bookingService from './booking.service.js';
import asyncWrapper from '../../middleware/asyncWrapper.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncWrapper(async (req, res) => {
  const booking = await bookingService.createBooking({
    userId: req.user.id,
    ...req.body
  });

  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getUserBookings = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.eventId) filters.eventId = req.query.eventId;
  if (req.query.upcoming !== undefined) filters.upcoming = req.query.upcoming === 'true';

  const result = await bookingService.getUserBookings(req.user.id, filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncWrapper(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = asyncWrapper(async (req, res) => {
  const booking = await bookingService.updateBooking(req.params.id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncWrapper(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Check venue availability
// @route   POST /api/bookings/check-availability
// @access  Private
export const checkVenueAvailability = asyncWrapper(async (req, res) => {
  const { venue, startTime, endTime, excludeBookingId } = req.body;

  if (!venue || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Please provide venue, startTime, and endTime'
    });
  }

  const result = await bookingService.checkVenueAvailability(venue, startTime, endTime, excludeBookingId);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get available time slots for a date
// @route   GET /api/bookings/availability
// @access  Public
export const getAvailableSlots = asyncWrapper(async (req, res) => {
  const { date, venue } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a date parameter'
    });
  }

  const result = await bookingService.getAvailableSlots(date, venue);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get all bookings
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
export const getAllBookings = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.eventId) filters.eventId = req.query.eventId;
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.venue) filters.venue = req.query.venue;
  if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
  if (req.query.dateTo) filters.dateTo = req.query.dateTo;

  const result = await bookingService.getAllBookings(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Update booking status
// @route   PUT /api/bookings/admin/:id/status
// @access  Private/Admin
export const updateBookingStatus = asyncWrapper(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a status'
    });
  }

  const booking = await bookingService.updateBookingStatus(req.params.id, status, req.user.id);

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Get booking statistics
// @route   GET /api/bookings/admin/stats
// @access  Private/Admin
export const getBookingStats = asyncWrapper(async (req, res) => {
  const stats = await bookingService.getBookingStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get single booking (admin)
// @route   GET /api/bookings/admin/:id
// @access  Private/Admin
export const getBookingAdmin = asyncWrapper(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id);

  res.status(200).json({
    success: true,
    data: booking
  });
});