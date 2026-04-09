import Stripe from 'stripe';
import Payment from './payment.model.js';
import Booking from '../bookings/booking.model.js';
import Event from '../events/event.model.js';

class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  // Create checkout session for booking payment
  async createCheckoutSession(bookingId, userId, successUrl, cancelUrl) {
    // Verify booking exists and belongs to user
    const booking = await Booking.findOne({ _id: bookingId, userId })
      .populate('eventId', 'title description basePrice')
      .populate('userId', 'name email');

    if (!booking) {
      throw new Error('Booking not found or access denied');
    }

    if (booking.status !== 'confirmed') {
      throw new Error('Booking must be confirmed before payment');
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment) {
      throw new Error('Payment already exists for this booking');
    }

    // Get event details for payment
    const event = booking.eventId;
    if (!event) {
      throw new Error('Event not found for booking');
    }

    // Calculate total amount from booking totalPrice
    const totalAmount = booking.totalPrice || 0;

    if (totalAmount <= 0) {
      throw new Error('Invalid payment amount');
    }

    // Validate amount for Stripe (minimum 50 cents, maximum ~$1M)
    if (totalAmount < 0.5 || totalAmount > 999999.99) {
      throw new Error('Payment amount must be between $0.50 and $999,999.99');
    }

    try {
      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: event.title,
                description: event.description,
                images: [], // Could add event images here
              },
              unit_amount: Math.round(totalAmount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        customer_email: booking.userId.email,
        metadata: {
          bookingId: bookingId.toString(),
          userId: userId.toString(),
          eventId: event._id.toString()
        },
        payment_intent_data: {
          metadata: {
            bookingId: bookingId.toString(),
            userId: userId.toString(),
            eventId: event._id.toString()
          }
        }
      });

      // Create payment record in database
      const payment = await Payment.create({
        bookingId,
        userId,
        vendorId: booking.vendorId || null, // May not have vendor yet
        amount: totalAmount,
        currency: 'usd',
        stripeSessionId: session.id,
        status: 'pending',
        metadata: {
          eventTitle: event.title,
          bookingDate: booking.startTime
        }
      });

      return {
        sessionId: session.id,
        sessionUrl: session.url,
        paymentId: payment._id
      };

    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(`Failed to create payment session: ${error.message}`);
    }
  }

  // Handle Stripe webhook
  async handleWebhook(rawBody, signature) {
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error('Invalid webhook signature');
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  // Handle successful checkout session
  async handleCheckoutSessionCompleted(session) {
    const { bookingId, userId } = session.metadata;

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { stripeSessionId: session.id },
      {
        status: 'succeeded',
        stripePaymentIntentId: session.payment_intent,
        paymentMethod: 'card'
      },
      { new: true }
    );

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Update booking status to 'paid'
    await Booking.findByIdAndUpdate(bookingId, {
      status: 'paid',
      paymentId: payment._id
    });

    console.log(`Payment succeeded for booking ${bookingId}`);
    return payment;
  }

  // Handle successful payment intent
  async handlePaymentIntentSucceeded(paymentIntent) {
    const { bookingId } = paymentIntent.metadata;

    // Update payment with payment intent ID if not already set
    await Payment.findOneAndUpdate(
      { bookingId },
      {
        stripePaymentIntentId: paymentIntent.id,
        status: 'succeeded'
      },
      { upsert: false }
    );

    console.log(`Payment intent succeeded for booking ${bookingId}`);
  }

  // Handle failed payment intent
  async handlePaymentIntentFailed(paymentIntent) {
    const { bookingId } = paymentIntent.metadata;

    // Update payment status to failed
    const payment = await Payment.findOneAndUpdate(
      { bookingId },
      {
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
      },
      { new: true }
    );

    if (payment) {
      // Update booking status back to confirmed (or handle as needed)
      await Booking.findByIdAndUpdate(bookingId, {
        status: 'confirmed' // Or 'payment_failed' if you add that status
      });
    }

    console.log(`Payment failed for booking ${bookingId}`);
  }

  // Get payment by ID
  async getPaymentById(paymentId) {
    const payment = await Payment.findById(paymentId)
      .populate('bookingId', 'eventId startTime venue status')
      .populate('userId', 'name email')
      .populate('vendorId', 'businessName');

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  // Get payments with filters
  async getPayments(filters = {}, page = 1, limit = 10) {
    const query = { ...filters };
    const skip = (page - 1) * limit;

    const payments = await Payment.find(query)
      .populate('bookingId', 'eventId startTime venue status')
      .populate('userId', 'name email')
      .populate('vendorId', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get payments for a user
  async getUserPayments(userId, page = 1, limit = 10) {
    return this.getPayments({ userId }, page, limit);
  }

  // Get payments for a vendor
  async getVendorPayments(vendorId, page = 1, limit = 10) {
    return this.getPayments({ vendorId }, page, limit);
  }

  // Process refund
  async processRefund(paymentId, amount, reason) {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'succeeded') {
      throw new Error('Can only refund successful payments');
    }

    try {
      // Create Stripe refund
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          paymentId: paymentId.toString(),
          reason: reason || ''
        }
      });

      // Update payment record
      await payment.processRefund(amount, reason);

      return {
        refundId: refund.id,
        amount: amount,
        status: 'processed'
      };

    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Get payment statistics
  async getPaymentStats() {
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'succeeded' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });
    const refundedPayments = await Payment.countDocuments({ status: 'refunded' });

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);

    return {
      total: totalPayments,
      successful: successfulPayments,
      failed: failedPayments,
      refunded: refundedPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0
    };
  }

  // Verify payment status with Stripe
  async verifyPaymentStatus(paymentId) {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    try {
      if (payment.stripeSessionId) {
        const session = await this.stripe.checkout.sessions.retrieve(payment.stripeSessionId);
        return {
          status: session.payment_status,
          paymentIntent: session.payment_intent
        };
      } else if (payment.stripePaymentIntentId) {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
        return {
          status: paymentIntent.status,
          paymentIntent: paymentIntent.id
        };
      }

      return { status: 'unknown' };
    } catch (error) {
      console.error('Error verifying payment status:', error);
      return { status: 'error', error: error.message };
    }
  }
}

export default new PaymentService();