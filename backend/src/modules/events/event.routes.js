import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
  getFeaturedEvents,
  searchEvents,
  getMyEvents,
  getEventStats,
  bulkUpdateEvents
} from './event.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import {
  validate,
  getEventsQuerySchema,
  getEventParamsSchema,
  createEventSchema,
  updateEventSchema,
  deleteEventParamsSchema,
  getEventsByCategorySchema,
  searchEventsQuerySchema,
  getFeaturedEventsQuerySchema,
  bulkUpdateEventsSchema
} from './event.validation.js';

const router = express.Router();

// Public routes
router.get('/', validate(getEventsQuerySchema), getEvents);
router.get('/search', validate(searchEventsQuerySchema), searchEvents);
router.get('/category/:category', validate(getEventsByCategorySchema), getEventsByCategory);
router.get('/featured', validate(getFeaturedEventsQuerySchema), getFeaturedEvents);
router.get('/:id', validate(getEventParamsSchema), getEvent);

// Admin only routes
router.post('/', protect, authorize('admin'), validate(createEventSchema), createEvent);
router.put('/bulk-update', protect, authorize('admin'), validate(bulkUpdateEventsSchema), bulkUpdateEvents);
router.get('/admin/my-events', protect, authorize('admin'), getMyEvents);
router.get('/admin/stats', protect, authorize('admin'), getEventStats);
router.put('/:id', protect, authorize('admin'), validate(updateEventSchema), updateEvent);
router.delete('/:id', protect, authorize('admin'), validate(deleteEventParamsSchema), deleteEvent);

export default router;