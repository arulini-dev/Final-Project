import User from '../auth/user.model.js';
import Event from '../events/event.model.js';
import Booking from '../bookings/booking.model.js';
import Payment from '../payments/payment.model.js';
import Vendor from '../vendors/vendor.model.js';
import Review from '../reviews/review.model.js';
import Message from '../chat/message.model.js';
import Category from '../categories/category.model.js';

class AdminService {
  // ===== USER MANAGEMENT =====

  // Get all users with pagination and filters
  async getAllUsers(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // Apply filters
    if (filters.role) query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // Update user
  async updateUser(userId, updateData) {
    const allowedFields = ['name', 'email', 'role', 'isActive', 'phone', 'avatar'];
    const filteredData = {};

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Delete user (soft delete)
  async deleteUser(userId) {
    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // ===== VENDOR MANAGEMENT =====

  // Get all vendors with pagination and filters
  async getAllVendors(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // Apply filters
    if (filters.isApproved !== undefined) query.isApproved = filters.isApproved;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.category) query.category = filters.category;
    if (filters.search) {
      query.$or = [
        { businessName: { $regex: filters.search, $options: 'i' } },
        { ownerName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vendor.countDocuments(query);

    return {
      vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Approve/Reject vendor
  async updateVendorStatus(vendorId, statusData) {
    const { isApproved, rejectionReason } = statusData;

    const updateData = { isApproved };
    if (!isApproved && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const vendor = await Vendor.findByIdAndUpdate(vendorId, updateData, { new: true })
      .populate('user', 'name email');

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    return vendor;
  }

  // ===== EVENT MANAGEMENT =====

  // Get all events (admin view - includes inactive)
  async getAllEvents(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.createdBy) query.createdBy = filters.createdBy;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update event status
  async updateEventStatus(eventId, statusData) {
    const { isActive, featured } = statusData;

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (featured !== undefined) updateData.featured = featured;

    const event = await Event.findByIdAndUpdate(eventId, updateData, { new: true })
      .populate('createdBy', 'name email');

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  // Create new event
  async createEvent(eventData, adminId) {
    const event = new Event({
      ...eventData,
      availableSpots: eventData.availableSpots || eventData.capacity,
      createdBy: adminId,
      isActive: true,
      featured: eventData.featured || false
    });

    await event.save();
    await event.populate('createdBy', 'name email');

    return event;
  }

  // Update event
  async updateEvent(eventId, updateData) {
    const event = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name email');

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  // ===== BOOKING MANAGEMENT =====

  // Get all bookings with pagination and filters
  async getAllBookings(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.eventId) query.eventId = filters.eventId;
    if (filters.userId) query.userId = filters.userId;
    if (filters.vendorId) query.vendorId = filters.vendorId;
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email')
      .populate('eventId', 'title category')
      .populate('vendorId', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update booking status
  async updateBookingStatus(bookingId, statusData) {
    const { status, adminNotes } = statusData;

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;

    const booking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true })
      .populate('userId', 'name email')
      .populate('eventId', 'title category')
      .populate('vendorId', 'businessName');

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  // ===== PAYMENT MANAGEMENT =====

  // Get all payments with pagination and filters
  async getAllPayments(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.bookingId) query.bookingId = filters.bookingId;
    if (filters.userId) query.userId = filters.userId;
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    const payments = await Payment.find(query)
      .populate('bookingId')
      .populate('userId', 'name email')
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

  // ===== REVIEW MANAGEMENT =====

  // Get all reviews with pagination and filters
  async getAllReviews(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // Apply filters
    if (filters.isApproved !== undefined) query.isApproved = filters.isApproved;
    if (filters.rating) query.rating = filters.rating;
    if (filters.eventId) query.eventId = filters.eventId;
    if (filters.userId) query.userId = filters.userId;
    if (filters.search) {
      query.$or = [
        { comment: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .populate('eventId', 'title')
      .populate('bookingId')
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

  // Approve/Reject review
  async updateReviewStatus(reviewId, statusData) {
    const { isApproved, adminResponse } = statusData;

    const updateData = { isApproved };
    if (adminResponse) updateData.adminResponse = adminResponse;

    const review = await Review.findByIdAndUpdate(reviewId, updateData, { new: true })
      .populate('userId', 'name email')
      .populate('eventId', 'title')
      .populate('bookingId');

    if (!review) {
      throw new Error('Review not found');
    }

    return review;
  }

  // Delete review
  async deleteReview(reviewId) {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    return review;
  }

  // ===== CHAT MANAGEMENT =====

  // Get all chat messages with pagination and filters
  async getAllMessages(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // Apply filters
    if (filters.bookingId) query.bookingId = filters.bookingId;
    if (filters.senderId) query.senderId = filters.senderId;
    if (filters.isRead !== undefined) query.isRead = filters.isRead;
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    const messages = await Message.find(query)
      .populate('senderId', 'name email role')
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(query);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Delete message
  async deleteMessage(messageId) {
    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    return message;
  }

  // ===== DASHBOARD STATS =====

  // Get admin dashboard statistics
  async getDashboardStats() {
    const [
      totalUsers,
      totalVendors,
      totalEvents,
      totalBookings,
      totalPayments,
      totalReviews,
      pendingVendors,
      recentBookings
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Vendor.countDocuments({ isApproved: true, isActive: true }),
      Event.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Payment.countDocuments({ status: 'completed' }),
      Review.countDocuments({ isApproved: true }),
      Vendor.countDocuments({ isApproved: false }),
      Booking.find()
        .populate('userId', 'name email')
        .populate('eventId', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Calculate revenue
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      overview: {
        totalUsers,
        totalVendors,
        totalEvents,
        totalBookings,
        totalPayments,
        totalReviews,
        totalRevenue,
        pendingVendors
      },
      recentBookings
    };
  }

  // ===== CATEGORY MANAGEMENT =====

  // Get all categories
  async getCategories() {
    const categories = await Category.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    return categories;
  }

  // Create new category
  async createCategory(categoryData, adminId) {
    const category = new Category({
      ...categoryData,
      createdBy: adminId
    });

    await category.save();
    await category.populate('createdBy', 'name email');

    return category;
  }

  // Delete category
  async deleteCategory(categoryId) {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category is being used by any events
    const eventsUsingCategory = await Event.countDocuments({ category: category.name, isActive: true });

    if (eventsUsingCategory > 0) {
      throw new Error(`Cannot delete category. It is being used by ${eventsUsingCategory} active event(s).`);
    }

    await Category.findByIdAndDelete(categoryId);
  }
}

export default new AdminService();