import Booking from './booking.model.js';
import Event from '../events/event.model.js';

class BookingService {
  // Create new booking with conflict detection
  async createBooking(bookingData) {
    const { userId, eventId, startTime, endTime, venue, totalPrice, specialRequests } = bookingData;

    // Check if event exists and is active
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      throw new Error('Event not found or inactive');
    }

    // Check if there are available spots
    if (event.availableSpots <= 0) {
      throw new Error('No available spots for this event');
    }

    // Check for booking conflicts
    const conflictingBooking = await Booking.checkConflict(venue, new Date(startTime), new Date(endTime));
    if (conflictingBooking) {
      throw new Error('Booking conflict detected. The venue is already booked for this time slot.');
    }

    // Decrement available spots first
    await Event.findByIdAndUpdate(eventId, { $inc: { availableSpots: -1 } });

    try {
      // Create booking
      const booking = await Booking.create({
        userId,
        eventId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        venue,
        totalPrice,
        specialRequests,
        status: 'confirmed' // Set to confirmed since payment will be processed next
      });

      // Populate references
      return await Booking.findById(booking._id)
        .populate('userId', 'name email phone')
        .populate('eventId', 'title category basePrice');
    } catch (error) {
      // If booking creation fails, increment available spots back
      await Event.findByIdAndUpdate(eventId, { $inc: { availableSpots: 1 } });
      throw error;
    }
  }

  // Get all bookings for a user
  async getUserBookings(userId, filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const query = { userId };

    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.eventId) query.eventId = filters.eventId;
    if (filters.upcoming !== undefined) {
      query.startTime = filters.upcoming ? { $gt: new Date() } : { $lt: new Date() };
    }

    const bookings = await Booking.find(query)
      .populate('eventId', 'title category basePrice images')
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

  // Get single booking by ID
  async getBookingById(bookingId, userId = null) {
    const query = { _id: bookingId };
    if (userId) query.userId = userId; // If userId provided, ensure booking belongs to user

    const booking = await Booking.findOne(query)
      .populate('userId', 'name email phone')
      .populate('eventId', 'title category basePrice images description');

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  // Update booking
  async updateBooking(bookingId, userId, updateData) {
    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Prevent updates for completed or cancelled bookings
    if (['completed', 'cancelled'].includes(booking.status)) {
      throw new Error('Cannot update completed or cancelled bookings');
    }

    const allowedFields = ['specialRequests'];
    const filteredData = {};

    // Only allow certain fields to be updated
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    // If updating time-related fields, check for conflicts
    if (updateData.startTime || updateData.endTime || updateData.venue) {
      const newStartTime = updateData.startTime ? new Date(updateData.startTime) : booking.startTime;
      const newEndTime = updateData.endTime ? new Date(updateData.endTime) : booking.endTime;
      const newVenue = updateData.venue || booking.venue;

      // Validate end time is after start time
      if (newEndTime <= newStartTime) {
        throw new Error('End time must be after start time');
      }

      // Check for conflicts (excluding current booking)
      const conflictingBooking = await Booking.checkConflict(newVenue, newStartTime, newEndTime, bookingId);
      if (conflictingBooking) {
        throw new Error('Booking conflict detected. The venue is already booked for this time slot.');
      }

      // Update time fields
      if (updateData.startTime) filteredData.startTime = newStartTime;
      if (updateData.endTime) filteredData.endTime = newEndTime;
      if (updateData.venue) filteredData.venue = newVenue;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      filteredData,
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email phone')
    .populate('eventId', 'title category basePrice images');

    return updatedBooking;
  }

  // Cancel booking
  async cancelBooking(bookingId, userId) {
    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'completed') {
      throw new Error('Cannot cancel a completed booking');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    // Increment available spots back
    await Event.findByIdAndUpdate(booking.eventId, { $inc: { availableSpots: 1 } });

    await booking.cancel();

    return await Booking.findById(bookingId)
      .populate('userId', 'name email phone')
      .populate('eventId', 'title category basePrice images');
  }

  // Get all bookings (admin only)
  async getAllBookings(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const query = {};

    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.eventId) query.eventId = filters.eventId;
    if (filters.userId) query.userId = filters.userId;
    if (filters.venue) query.venue = { $regex: filters.venue, $options: 'i' };
    if (filters.dateFrom) query.startTime = { ...query.startTime, $gte: new Date(filters.dateFrom) };
    if (filters.dateTo) query.endTime = { ...query.endTime, $lte: new Date(filters.dateTo) };

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('eventId', 'title category basePrice')
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

  // Update booking status (admin only)
  async updateBookingStatus(bookingId, status, adminId) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    // Validate status transitions
    if (booking.status === 'completed' && status !== 'completed') {
      throw new Error('Cannot change status of completed booking');
    }

    if (booking.status === 'cancelled' && status !== 'cancelled') {
      throw new Error('Cannot change status of cancelled booking');
    }

    booking.status = status;
    await booking.save();

    return await Booking.findById(bookingId)
      .populate('userId', 'name email phone')
      .populate('eventId', 'title category basePrice images');
  }

  // Get booking statistics (admin only)
  async getBookingStats() {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageBookingValue: { $avg: '$totalPrice' },
          bookingsByStatus: {
            $push: '$status'
          }
        }
      }
    ]);

    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const monthlyStats = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    return {
      overall: stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0
      },
      byStatus: statusStats,
      monthly: monthlyStats
    };
  }

  // Check venue availability
  async checkVenueAvailability(venue, startTime, endTime, excludeBookingId = null) {
    const conflictingBooking = await Booking.checkConflict(venue, new Date(startTime), new Date(endTime), excludeBookingId);

    return {
      available: !conflictingBooking,
      conflictingBooking: conflictingBooking ? {
        id: conflictingBooking._id,
        startTime: conflictingBooking.startTime,
        endTime: conflictingBooking.endTime,
        userId: conflictingBooking.userId
      } : null
    };
  }

  // Get available time slots for a specific date
  async getAvailableSlots(date, venue = null) {
    // Parse the input date
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Set the date to start of day (00:00:00)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Set the date to end of day (23:59:59)
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Define business hours (9 AM to 6 PM)
    const businessStartHour = 9;
    const businessEndHour = 18;
    const slotDuration = 60; // 60 minutes

    // Generate all possible time slots for the day
    const allSlots = [];
    for (let hour = businessStartHour; hour < businessEndHour; hour++) {
      const slotStart = new Date(startOfDay);
      slotStart.setHours(hour, 0, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + slotDuration);

      allSlots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        available: true
      });
    }

    // Find all bookings for this date (across all venues or specific venue)
    const query = {
      startTime: { $lt: endOfDay },
      endTime: { $gt: startOfDay },
      status: { $in: ['pending', 'confirmed'] }
    };

    if (venue) {
      query.venue = venue;
    }

    const bookings = await Booking.find(query).select('startTime endTime venue');

    // Mark slots as unavailable if they conflict with any booking
    const availableSlots = allSlots.map(slot => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);

      // Check if this slot conflicts with any booking
      const hasConflict = bookings.some(booking => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);

        // Check for overlap: slot starts before booking ends AND slot ends after booking starts
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      return {
        ...slot,
        available: !hasConflict
      };
    });

    return {
      date: targetDate.toISOString().split('T')[0],
      venue: venue || 'all',
      slots: availableSlots,
      totalSlots: availableSlots.length,
      availableSlots: availableSlots.filter(slot => slot.available).length,
      bookedSlots: availableSlots.filter(slot => !slot.available).length
    };
  }
}

export default new BookingService();