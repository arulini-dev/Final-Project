import paymentService from './payment.service.js';
import asyncWrapper from '../../middleware/asyncWrapper.js';

class PaymentController {
  // Create checkout session for booking payment
  createCheckoutSession = asyncWrapper(async (req, res) => {
    const { bookingId, successUrl, cancelUrl } = req.body;
    const userId = req.user.id;

    const result = await paymentService.createCheckoutSession(
      bookingId,
      userId,
      successUrl,
      cancelUrl
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Handle Stripe webhook
  handleWebhook = asyncWrapper(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const rawBody = req.rawBody || req.body;

    await paymentService.handleWebhook(rawBody, sig);

    res.status(200).json({ received: true });
  });

  // Get payment by ID
  getPaymentById = asyncWrapper(async (req, res) => {
    const payment = await paymentService.getPaymentById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: payment
    });
  });

  // Get user's payments
  getUserPayments = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const result = await paymentService.getUserPayments(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get vendor's payments (for vendors)
  getVendorPayments = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const vendor = await require('../vendors/vendor.service.js').default.getVendorByUserId(req.user.id);

    const result = await paymentService.getVendorPayments(
      vendor._id,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get all payments (admin only)
  getAllPayments = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 10, status, userId, vendorId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (userId) filters.userId = userId;
    if (vendorId) filters.vendorId = vendorId;

    const result = await paymentService.getPayments(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Process refund (admin only)
  processRefund = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const result = await paymentService.processRefund(id, amount, reason);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get payment statistics (admin only)
  getPaymentStats = asyncWrapper(async (req, res) => {
    const stats = await paymentService.getPaymentStats();

    res.status(200).json({
      status: 'success',
      data: stats
    });
  });

  // Verify payment status with Stripe
  verifyPaymentStatus = asyncWrapper(async (req, res) => {
    const result = await paymentService.verifyPaymentStatus(req.params.id);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get payment session status (for frontend redirect handling)
  getSessionStatus = asyncWrapper(async (req, res) => {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID is required'
      });
    }

    try {
      const session = await paymentService.stripe.checkout.sessions.retrieve(session_id);

      res.status(200).json({
        status: 'success',
        data: {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          customerEmail: session.customer_details?.email,
          amountTotal: session.amount_total / 100, // Convert from cents
          currency: session.currency
        }
      });
    } catch (error) {
      console.error('Error retrieving session:', error);
      res.status(400).json({
        status: 'error',
        message: 'Invalid session ID'
      });
    }
  });
}

export default new PaymentController();