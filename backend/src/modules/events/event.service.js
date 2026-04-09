import Event from './event.model.js';

class EventService {
  // Get all events (public)
  async getAllEvents(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const query = { isActive: true, status: { $ne: 'cancelled' } };

    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.minPrice !== undefined) query.basePrice = { ...query.basePrice, $gte: filters.minPrice };
    if (filters.maxPrice !== undefined) query.basePrice = { ...query.basePrice, $lte: filters.maxPrice };
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort(filters.sortBy ? { [filters.sortBy]: filters.sortOrder || -1 } : { createdAt: -1 })
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

  // Get single event by ID (public)
  async getEventById(eventId) {
    const event = await Event.findById(eventId)
      .populate('createdBy', 'name email')
      .populate('reviews');

    if (!event || !event.isActive) {
      throw new Error('Event not found');
    }

    return event;
  }

  // Create new event (admin only)
  async createEvent(eventData, adminId) {
    const event = await Event.create({
      ...eventData,
      createdBy: adminId
    });

    return await Event.findById(event._id).populate('createdBy', 'name email');
  }

  // Update event (admin only)
  async updateEvent(eventId, updateData, adminId) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Only allow certain fields to be updated
    const allowedFields = ['title', 'description', 'basePrice', 'category', 'images', 'isActive'];
    const filteredData = {};

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      filteredData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return updatedEvent;
  }

  // Delete event (admin only) - soft delete
  async deleteEvent(eventId, adminId) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Soft delete by setting isActive to false
    await Event.findByIdAndUpdate(eventId, { isActive: false });

    return { message: 'Event deleted successfully' };
  }

  // Get events by category (public)
  async getEventsByCategory(category, page = 1, limit = 10) {
    return await this.getAllEvents({ category }, page, limit);
  }

  // Get featured/popular events (public)
  async getFeaturedEvents(limit = 6) {
    const events = await Event.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
      .limit(limit);

    return events;
  }

  // Search events (public)
  async searchEvents(searchTerm, page = 1, limit = 10) {
    return await this.getAllEvents({ search: searchTerm }, page, limit);
  }

  // Get events created by admin (admin only)
  async getMyEvents(adminId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const events = await Event.find({ createdBy: adminId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments({ createdBy: adminId });

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

  // Get event statistics (admin only)
  async getEventStats() {
    const stats = await Event.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          averagePrice: { $avg: '$basePrice' },
          minPrice: { $min: '$basePrice' },
          maxPrice: { $max: '$basePrice' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    const categoryStats = await Event.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$basePrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      overall: stats[0] || {
        totalEvents: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        categories: []
      },
      byCategory: categoryStats
    };
  }

  // Bulk update events (admin only)
  async bulkUpdateEvents(eventIds, updateData, adminId) {
    const allowedFields = ['isActive', 'category'];

    // Validate update data
    const filteredData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const result = await Event.updateMany(
      { _id: { $in: eventIds }, isActive: true },
      filteredData,
      { runValidators: true }
    );

    return {
      message: `${result.modifiedCount} events updated successfully`,
      modifiedCount: result.modifiedCount
    };
  }
}

export default new EventService();