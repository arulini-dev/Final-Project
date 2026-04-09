import express from 'express';
import paymentController from './payment.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/auth.js';
import validate from '../../middleware/validate.js';
import {
  createCheckoutSessionSchema,
  paymentIdSchema,
  paymentQuerySchema,
  refundPaymentSchema
} from './payment.validation.js';

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Checkout and payment processing
router.post('/create-checkout-session', validate(createCheckoutSessionSchema), paymentController.createCheckoutSession);
router.get('/session-status', paymentController.getSessionStatus);

// Payment information
router.get('/my-payments', validate(paymentQuerySchema), paymentController.getUserPayments);
router.get('/:id', validate(paymentIdSchema), paymentController.getPaymentById);

// Vendor routes
router.get('/vendor/payments', authorize('vendor'), validate(paymentQuerySchema), paymentController.getVendorPayments);

// Admin routes
router.get('/admin/all', authorize('admin'), validate(paymentQuerySchema), paymentController.getAllPayments);
router.post('/:id/refund', authorize('admin'), validate(paymentIdSchema), validate(refundPaymentSchema), paymentController.processRefund);
router.get('/admin/stats', authorize('admin'), paymentController.getPaymentStats);
router.get('/:id/verify', authorize('admin'), validate(paymentIdSchema), paymentController.verifyPaymentStatus);

// Webhook route (no authentication needed, but should be protected by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

export default router;