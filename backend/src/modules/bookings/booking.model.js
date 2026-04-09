import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID']
  },
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Please provide an event ID']
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide an end time'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  venue: {
    type: String,
    required: [true, 'Please provide a venue'],
    trim: true,
    maxlength: [200, 'Venue cannot be more than 200 characters']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Please provide a total price'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'paid', 'cancelled', 'completed'],
      message: 'Status must be one of: pending, confirmed, paid, cancelled, completed'
    },
    default: 'pending'
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'refunded'],
      message: 'Payment status must be one of: pending, paid, refunded'
    },
    default: 'pending'
  },
  paymentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ userId: 1, startTime: -1 });
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });
bookingSchema.index({ venue: 1, startTime: 1 });

// Virtual for duration in hours
bookingSchema.virtual('duration').get(function() {
  return Math.round((this.endTime - this.startTime) / (1000 * 60 * 60) * 100) / 100;
});

// Virtual for checking if booking is in the future
bookingSchema.virtual('isUpcoming').get(function() {
  return this.startTime > new Date();
});

// Static method to check for booking conflicts
bookingSchema.statics.checkConflict = async function(venue, startTime, endTime, excludeBookingId = null) {
  const query = {
    venue,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gt: startTime } }
        ]
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await this.findOne(query);
  return conflictingBooking;
};

// Instance method to cancel booking
bookingSchema.methods.cancel = async function() {
  if (this.status === 'completed') {
    throw new Error('Cannot cancel a completed booking');
  }

  this.status = 'cancelled';
  return this.save();
};

// Instance method to confirm booking
bookingSchema.methods.confirm = async function() {
  if (this.status !== 'pending') {
    throw new Error('Only pending bookings can be confirmed');
  }

  this.status = 'confirmed';
  return this.save();
};

// Instance method to complete booking
bookingSchema.methods.complete = async function() {
  if (this.status !== 'confirmed') {
    throw new Error('Only confirmed bookings can be completed');
  }

  this.status = 'completed';
  return this.save();
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;