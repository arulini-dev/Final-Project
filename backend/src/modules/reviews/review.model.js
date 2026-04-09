import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: [true, 'Please provide a booking ID'],
    unique: true // One review per booking
  },
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
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
reviewSchema.index({ eventId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

// Prevent multiple reviews for the same booking
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await mongoose.model('Review').findOne({ bookingId: this.bookingId });
    if (existingReview) {
      const error = new Error('A review already exists for this booking');
      return next(error);
    }
  }
  next();
});

// Static method to calculate average rating for an event
reviewSchema.statics.calculateAverageRating = async function(eventId) {
  const stats = await this.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$eventId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: stats[0].totalReviews
    };
  }

  return { averageRating: 0, totalReviews: 0 };
};

// Instance method to update event's average rating after save
reviewSchema.post('save', async function() {
  const Event = mongoose.model('Event');
  const stats = await this.constructor.calculateAverageRating(this.eventId);

  await Event.findByIdAndUpdate(this.eventId, {
    averageRating: stats.averageRating,
    totalReviews: stats.totalReviews
  });
});

// Instance method to update event's average rating after remove
reviewSchema.post('remove', async function() {
  const Event = mongoose.model('Event');
  const stats = await this.constructor.calculateAverageRating(this.eventId);

  await Event.findByIdAndUpdate(this.eventId, {
    averageRating: stats.averageRating,
    totalReviews: stats.totalReviews
  });
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;