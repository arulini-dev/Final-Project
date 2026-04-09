import express from 'express';
import serviceController from './service.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/auth.js';
import validate from '../../middleware/validate.js';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  serviceQuerySchema,
  checkAvailabilitySchema
} from './service.validation.js';

const router = express.Router();

// Public routes
router.get('/featured', serviceController.getFeaturedServices);
router.get('/search', validate(serviceQuerySchema), serviceController.getServices);
router.get('/category/:category', validate(serviceQuerySchema), serviceController.getServices);
router.get('/:id', validate(serviceIdSchema), serviceController.getServiceById);
router.get('/vendor/:vendorId', validate(serviceQuerySchema), serviceController.getServicesByVendor);

// Protected routes (require authentication)
router.use(protect);

// Vendor service management
router.post('/', validate(createServiceSchema), serviceController.createService);
router.get('/profile/my', serviceController.getMyServices);
router.patch('/:id', validate(serviceIdSchema), validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', validate(serviceIdSchema), serviceController.deleteService);

// Service availability
router.post('/:id/availability', validate(serviceIdSchema), validate(checkAvailabilitySchema), serviceController.checkAvailability);

// Admin only routes
router.get('/admin/stats', authorize('admin'), serviceController.getServiceStats);

export default router;