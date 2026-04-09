import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: [true, 'Please provide a booking ID'],
    unique: true // One payment per booking
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID']
  },
  vendorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vendor',
    required: [true, 'Please provide a vendor ID']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'usd',
    enum: ['usd', 'eur', 'gbp']
  },
  stripeSessionId: {
    type: String,
    required: [true, 'Please provide Stripe session ID'],
    unique: true
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true // Not all payments will have this immediately
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'],
      message: 'Status must be pending, processing, succeeded, failed, canceled, or refunded'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'other']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  refundedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refunded amount cannot be negative']
  },
  refundReason: {
    type: String,
    maxlength: [500, 'Refund reason cannot exceed 500 characters']
  },
  failureReason: {
    type: String,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
paymentSchema.index({ userId: 1 });
paymentSchema.index({ vendorId: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for booking info
paymentSchema.virtual('booking', {
  ref: 'Booking',
  localField: 'bookingId',
  foreignField: '_id',
  justOne: true
});

// Virtual for user info
paymentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for vendor info
paymentSchema.virtual('vendor', {
  ref: 'Vendor',
  localField: 'vendorId',
  foreignField: '_id',
  justOne: true
});

// Virtual for refund status
paymentSchema.virtual('isRefunded').get(function() {
  return this.status === 'refunded' || this.refundedAmount > 0;
});

// Virtual for net amount (after refunds)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.refundedAmount;
});

// Static method to get payments by status
paymentSchema.statics.getPaymentsByStatus = function(status, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  return this.find({ status })
    .populate('bookingId', 'eventId startTime venue status')
    .populate('userId', 'name email')
    .populate('vendorId', 'businessName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get payments for a user
paymentSchema.statics.getUserPayments = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  return this.find({ userId })
    .populate('bookingId', 'eventId startTime venue status')
    .populate('vendorId', 'businessName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get payments for a vendor
paymentSchema.statics.getVendorPayments = function(vendorId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  return this.find({ vendorId })
    .populate('bookingId', 'eventId startTime venue status')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Instance method to process refund
paymentSchema.methods.processRefund = function(amount, reason) {
  if (this.status !== 'succeeded') {
    throw new Error('Can only refund successful payments');
  }

  if (amount > this.netAmount) {
    throw new Error('Refund amount cannot exceed net payment amount');
  }

  this.refundedAmount += amount;
  this.refundReason = reason;

  if (this.refundedAmount >= this.amount) {
    this.status = 'refunded';
  }

  return this.save();
};

// Pre-save middleware to ensure booking uniqueness
paymentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingPayment = await this.constructor.findOne({ bookingId: this.bookingId });
    if (existingPayment) {
      const error = new Error('Payment already exists for this booking');
      return next(error);
    }
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;