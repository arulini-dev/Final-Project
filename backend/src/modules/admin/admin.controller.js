import adminService from './admin.service.js';
import asyncWrapper from '../../middleware/asyncWrapper.js';

// ===== DASHBOARD =====

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboard = asyncWrapper(async (req, res) => {
  const stats = await adminService.getDashboardStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

// ===== USER MANAGEMENT =====

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.role) filters.role = req.query.role;
  if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
  if (req.query.search) filters.search = req.query.search;

  const result = await adminService.getAllUsers(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUser = asyncWrapper(async (req, res) => {
  const user = await adminService.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncWrapper(async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: user,
    message: 'User updated successfully'
  });
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncWrapper(async (req, res) => {
  await adminService.deleteUser(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully'
  });
});

// ===== VENDOR MANAGEMENT =====

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
export const getVendors = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.isApproved !== undefined) filters.isApproved = req.query.isApproved === 'true';
  if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
  if (req.query.category) filters.category = req.query.category;
  if (req.query.search) filters.search = req.query.search;

  const result = await adminService.getAllVendors(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Update vendor status (approve/reject)
// @route   PUT /api/admin/vendors/:id/status
// @access  Private/Admin
export const updateVendorStatus = asyncWrapper(async (req, res) => {
  const vendor = await adminService.updateVendorStatus(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: vendor,
    message: `Vendor ${req.body.isApproved ? 'approved' : 'rejected'} successfully`
  });
});

// ===== EVENT MANAGEMENT =====

// @desc    Get all events (admin view)
// @route   GET /api/admin/events
// @access  Private/Admin
export const getEvents = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.category) filters.category = filters.category;
  if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
  if (req.query.createdBy) filters.createdBy = req.query.createdBy;
  if (req.query.search) filters.search = req.query.search;

  const result = await adminService.getAllEvents(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Update event status
// @route   PUT /api/admin/events/:id/status
// @access  Private/Admin
export const updateEventStatus = asyncWrapper(async (req, res) => {
  const event = await adminService.updateEventStatus(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: event,
    message: 'Event status updated successfully'
  });
});

// @desc    Create new event
// @route   POST /api/admin/events
// @access  Private/Admin
export const createEvent = asyncWrapper(async (req, res) => {
  const event = await adminService.createEvent(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: event,
    message: 'Event created successfully'
  });
});

// @desc    Update event
// @route   PUT /api/admin/events/:id
// @access  Private/Admin
export const updateEvent = asyncWrapper(async (req, res) => {
  const event = await adminService.updateEvent(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: event,
    message: 'Event updated successfully'
  });
});

// ===== BOOKING MANAGEMENT =====

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getBookings = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.eventId) filters.eventId = req.query.eventId;
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.vendorId) filters.vendorId = req.query.vendorId;
  if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
  if (req.query.dateTo) filters.dateTo = req.query.dateTo;

  const result = await adminService.getAllBookings(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = asyncWrapper(async (req, res) => {
  const booking = await adminService.updateBookingStatus(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: booking,
    message: 'Booking status updated successfully'
  });
});

// ===== PAYMENT MANAGEMENT =====

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getPayments = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.bookingId) filters.bookingId = req.query.bookingId;
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
  if (req.query.dateTo) filters.dateTo = req.query.dateTo;

  const result = await adminService.getAllPayments(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// ===== REVIEW MANAGEMENT =====

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getReviews = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.isApproved !== undefined) filters.isApproved = req.query.isApproved === 'true';
  if (req.query.rating) filters.rating = parseInt(req.query.rating);
  if (req.query.eventId) filters.eventId = req.query.eventId;
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.search) filters.search = req.query.search;

  const result = await adminService.getAllReviews(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Update review status
// @route   PUT /api/admin/reviews/:id/status
// @access  Private/Admin
export const updateReviewStatus = asyncWrapper(async (req, res) => {
  const review = await adminService.updateReviewStatus(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: review,
    message: `Review ${req.body.isApproved ? 'approved' : 'rejected'} successfully`
  });
});

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncWrapper(async (req, res) => {
  await adminService.deleteReview(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// ===== CHAT MANAGEMENT =====

// @desc    Get all chat messages
// @route   GET /api/admin/chats
// @access  Private/Admin
export const getMessages = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.bookingId) filters.bookingId = req.query.bookingId;
  if (req.query.senderId) filters.senderId = req.query.senderId;
  if (req.query.isRead !== undefined) filters.isRead = req.query.isRead === 'true';
  if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
  if (req.query.dateTo) filters.dateTo = req.query.dateTo;

  const result = await adminService.getAllMessages(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Delete chat message
// @route   DELETE /api/admin/chats/:id
// @access  Private/Admin
export const deleteMessage = asyncWrapper(async (req, res) => {
  await adminService.deleteMessage(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// ===== CATEGORY MANAGEMENT =====

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
export const getCategories = asyncWrapper(async (req, res) => {
  const categories = await adminService.getCategories();

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = asyncWrapper(async (req, res) => {
  const category = await adminService.createCategory(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully'
  });
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncWrapper(async (req, res) => {
  await adminService.deleteCategory(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});