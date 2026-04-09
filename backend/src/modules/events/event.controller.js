import eventService from './event.service.js';
import asyncWrapper from '../../middleware/asyncWrapper.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = {};
  if (req.query.category) filters.category = req.query.category;
  if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice);
  if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice);
  if (req.query.search) filters.search = req.query.search;
  if (req.query.sortBy) filters.sortBy = req.query.sortBy;
  if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const result = await eventService.getAllEvents(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = asyncWrapper(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = asyncWrapper(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = asyncWrapper(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body, req.user.id);

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = asyncWrapper(async (req, res) => {
  const result = await eventService.deleteEvent(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get events by category
// @route   GET /api/events/category/:category
// @access  Public
export const getEventsByCategory = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await eventService.getEventsByCategory(req.params.category, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
export const getFeaturedEvents = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;

  const events = await eventService.getFeaturedEvents(limit);

  res.status(200).json({
    success: true,
    data: events
  });
});

// @desc    Search events
// @route   GET /api/events/search
// @access  Public
export const searchEvents = asyncWrapper(async (req, res) => {
  const { q: searchTerm } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a search term'
    });
  }

  const result = await eventService.searchEvents(searchTerm, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get my events (admin only)
// @route   GET /api/events/my-events
// @access  Private/Admin
export const getMyEvents = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await eventService.getMyEvents(req.user.id, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get event statistics
// @route   GET /api/events/stats
// @access  Private/Admin
export const getEventStats = asyncWrapper(async (req, res) => {
  const stats = await eventService.getEventStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Bulk update events
// @route   PUT /api/events/bulk-update
// @access  Private/Admin
export const bulkUpdateEvents = asyncWrapper(async (req, res) => {
  const { eventIds, updateData } = req.body;

  if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of event IDs'
    });
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide update data'
    });
  }

  const result = await eventService.bulkUpdateEvents(eventIds, updateData, req.user.id);

  res.status(200).json({
    success: true,
    data: result
  });
});