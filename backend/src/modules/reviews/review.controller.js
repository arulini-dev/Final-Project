import reviewService from './review.service.js';
import Review from './review.model.js';
import asyncWrapper from '../../middleware/asyncWrapper.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncWrapper(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Get reviews for an event
// @route   GET /api/reviews/event/:eventId
// @access  Public
export const getEventReviews = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.rating) filters.rating = parseInt(req.query.rating);
  if (req.query.minRating) filters.minRating = parseInt(req.query.minRating);
  if (req.query.maxRating) filters.maxRating = parseInt(req.query.maxRating);
  if (req.query.sortBy) filters.sortBy = req.query.sortBy;
  if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder;

  const result = await reviewService.getEventReviews(req.params.eventId, filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getUserReviews = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await reviewService.getUserReviews(req.user.id, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Private (own review) or Public (for event reviews)
export const getReview = asyncWrapper(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncWrapper(async (req, res) => {
  const review = await reviewService.updateReview(req.params.id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncWrapper(async (req, res) => {
  const result = await reviewService.deleteReview(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Check if user can review a booking
// @route   GET /api/reviews/can-review/:bookingId
// @access  Private
export const checkCanReview = asyncWrapper(async (req, res) => {
  const result = await reviewService.canReviewBooking(req.user.id, req.params.bookingId);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get all reviews
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
export const getAllReviews = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.rating) filters.rating = parseInt(req.query.rating);
  if (req.query.eventId) filters.eventId = req.query.eventId;
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
  if (req.query.dateTo) filters.dateTo = req.query.dateTo;

  const result = await reviewService.getAllReviews(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get review statistics
// @route   GET /api/reviews/admin/stats
// @access  Private/Admin
export const getReviewStats = asyncWrapper(async (req, res) => {
  const stats = await reviewService.getReviewStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get single review (admin)
// @route   GET /api/reviews/admin/:id
// @access  Private/Admin
export const getReviewAdmin = asyncWrapper(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.id);

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Delete review (admin)
// @route   DELETE /api/reviews/admin/:id
// @access  Private/Admin
export const deleteReviewAdmin = asyncWrapper(async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: { message: 'Review deleted successfully' }
  });
});