import mongoose from 'mongoose';
import Review from './review.model.js';
import Booking from '../bookings/booking.model.js';
import Event from '../events/event.model.js';

class ReviewService {
  // Create a new review
  async createReview(userId, reviewData) {
    const { bookingId, rating, comment } = reviewData;

    // Check if booking exists and belongs to the user
    const booking = await Booking.findOne({ _id: bookingId, userId })
      .populate('eventId');

    if (!booking) {
      throw new Error('Booking not found or does not belong to you');
    }

    // Check if booking is completed (only completed bookings can be reviewed)
    if (booking.status !== 'completed') {
      throw new Error('You can only review completed bookings');
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      throw new Error('A review already exists for this booking');
    }

    // Create the review
    const review = await Review.create({
      bookingId,
      userId,
      eventId: booking.eventId._id,
      rating,
      comment
    });

    // Populate the review with user and event data
    return await Review.findById(review._id)
      .populate('userId', 'name email')
      .populate('eventId', 'title category');
  }

  // Get reviews for a specific event
  async getEventReviews(eventId, filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const query = { eventId };

    // Apply filters
    if (filters.rating) query.rating = filters.rating;
    if (filters.minRating) query.rating = { ...query.rating, $gte: filters.minRating };
    if (filters.maxRating) query.rating = { ...query.rating, $lte: filters.maxRating };

    const reviews = await Review.find(query)
      .populate('userId', 'name email avatar')
      .populate('bookingId', 'startTime venue')
      .sort(filters.sortBy ? { [filters.sortBy]: filters.sortOrder || -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    // Calculate rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      ratingDistribution: ratingStats
    };
  }

  // Get user's reviews
  async getUserReviews(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId })
      .populate('eventId', 'title category images')
      .populate('bookingId', 'startTime venue totalPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ userId });

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get single review by ID
  async getReviewById(reviewId, userId = null) {
    const query = { _id: reviewId };
    if (userId) query.userId = userId; // If userId provided, ensure review belongs to user

    const review = await Review.findOne(query)
      .populate('userId', 'name email avatar')
      .populate('eventId', 'title category images')
      .populate('bookingId', 'startTime endTime venue totalPrice');

    if (!review) {
      throw new Error('Review not found');
    }

    return review;
  }

  // Update review
  async updateReview(reviewId, userId, updateData) {
    const review = await Review.findOne({ _id: reviewId, userId });

    if (!review) {
      throw new Error('Review not found or does not belong to you');
    }

    // Only allow updating rating and comment
    const allowedFields = ['rating', 'comment'];
    const filteredData = {};

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      filteredData,
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email avatar')
    .populate('eventId', 'title category images')
    .populate('bookingId', 'startTime venue totalPrice');

    return updatedReview;
  }

  // Delete review
  async deleteReview(reviewId, userId) {
    const review = await Review.findOne({ _id: reviewId, userId });

    if (!review) {
      throw new Error('Review not found or does not belong to you');
    }

    await Review.findByIdAndDelete(reviewId);

    return { message: 'Review deleted successfully' };
  }

  // Get all reviews (admin only)
  async getAllReviews(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const query = {};

    // Apply filters
    if (filters.rating) query.rating = filters.rating;
    if (filters.eventId) query.eventId = filters.eventId;
    if (filters.userId) query.userId = filters.userId;
    if (filters.dateFrom) query.createdAt = { ...query.createdAt, $gte: new Date(filters.dateFrom) };
    if (filters.dateTo) query.createdAt = { ...query.createdAt, $lte: new Date(filters.dateTo) };

    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .populate('eventId', 'title category')
      .populate('bookingId', 'startTime venue totalPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get review statistics (admin only)
  async getReviewStats() {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    const ratingDist = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Monthly review trends
    const monthlyStats = await Review.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    return {
      overall: stats[0] ? {
        totalReviews: stats[0].totalReviews,
        averageRating: Math.round(stats[0].averageRating * 10) / 10
      } : { totalReviews: 0, averageRating: 0 },
      ratingDistribution: ratingDist,
      monthlyTrends: monthlyStats
    };
  }

  // Check if user can review a booking
  async canReviewBooking(userId, bookingId) {
    const booking = await Booking.findOne({ _id: bookingId, userId, status: 'completed' });

    if (!booking) {
      return { canReview: false, reason: 'Booking not found, not completed, or does not belong to you' };
    }

    const existingReview = await Review.findOne({ bookingId });

    if (existingReview) {
      return { canReview: false, reason: 'Review already exists for this booking' };
    }

    return { canReview: true, booking };
  }
}

export default new ReviewService();