import express from 'express';
import {
  createReview,
  getEventReviews,
  getUserReviews,
  getReview,
  updateReview,
  deleteReview,
  checkCanReview,
  getAllReviews,
  getReviewStats,
  getReviewAdmin,
  deleteReviewAdmin
} from './review.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import {
  validate,
  createReviewSchema,
  getEventReviewsQuerySchema,
  getUserReviewsQuerySchema,
  getReviewParamsSchema,
  updateReviewSchema,
  deleteReviewParamsSchema,
  checkCanReviewParamsSchema,
  getAllReviewsQuerySchema,
  getReviewAdminParamsSchema,
  deleteReviewAdminParamsSchema
} from './review.validation.js';

const router = express.Router();

// Public routes
router.get('/event/:eventId', validate(getEventReviewsQuerySchema), getEventReviews);

// Protected routes
router.use(protect);

router.post('/', validate(createReviewSchema), createReview);
router.get('/my-reviews', validate(getUserReviewsQuerySchema), getUserReviews);
router.get('/:id', validate(getReviewParamsSchema), getReview);
router.put('/:id', validate(updateReviewSchema), updateReview);
router.delete('/:id', validate(deleteReviewParamsSchema), deleteReview);
router.get('/can-review/:bookingId', validate(checkCanReviewParamsSchema), checkCanReview);

// Admin routes
router.get('/admin/all', authorize('admin'), validate(getAllReviewsQuerySchema), getAllReviews);
router.get('/admin/stats', authorize('admin'), getReviewStats);
router.get('/admin/:id', authorize('admin'), validate(getReviewAdminParamsSchema), getReviewAdmin);
router.delete('/admin/:id', authorize('admin'), validate(deleteReviewAdminParamsSchema), deleteReviewAdmin);

export default router;