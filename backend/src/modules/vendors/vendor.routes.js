import express from 'express';
import vendorController from './vendor.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/auth.js';
import validate from '../../middleware/validate.js';
import {
  createVendorSchema,
  updateVendorSchema,
  vendorIdSchema,
  vendorQuerySchema,
  approveVendorSchema
} from './vendor.validation.js';

const router = express.Router();

// Public routes
router.get('/approved', validate(vendorQuerySchema), vendorController.getApprovedVendors);
router.get('/:id', validate(vendorIdSchema), vendorController.getVendorById);

// Protected routes (require authentication)
router.use(protect);

// Vendor management routes
router.post('/', validate(createVendorSchema), vendorController.createVendor);
router.get('/profile/my', vendorController.getMyVendor);
router.patch('/:id', validate(vendorIdSchema), validate(updateVendorSchema), vendorController.updateVendor);
router.delete('/:id', validate(vendorIdSchema), vendorController.deleteVendor);

// Admin only routes
router.get('/admin/all', authorize('admin'), validate(vendorQuerySchema), vendorController.getAllVendors);
router.patch('/:id/approve', authorize('admin'), validate(vendorIdSchema), validate(approveVendorSchema), vendorController.approveVendor);
router.get('/admin/stats', authorize('admin'), vendorController.getVendorStats);

export default router;