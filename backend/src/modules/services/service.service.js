import Service from './service.model.js';
import Vendor from '../vendors/vendor.model.js';

class ServiceService {
  // Create a new service
  async createService(serviceData, vendorId) {
    // Verify vendor exists and is approved
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    if (!vendor.approved) {
      throw new Error('Vendor must be approved to create services');
    }

    const service = await Service.create({
      ...serviceData,
      vendorId
    });

    await service.populate('vendorId', 'businessName rating logo');

    return service;
  }

  // Get all services with filters
  async getServices(filters = {}, page = 1, limit = 10, sortBy = 'rating', sortOrder = 'desc') {
    const query = { isActive: true, ...filters };
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const services = await Service.find(query)
      .populate('vendorId', 'businessName rating logo')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(query);

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get services by category
  async getServicesByCategory(category, filters = {}, page = 1, limit = 10) {
    const query = { category, isActive: true, ...filters };
    const skip = (page - 1) * limit;

    const services = await Service.find(query)
      .populate('vendorId', 'businessName rating logo')
      .sort({ rating: -1, price: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(query);

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Search services
  async searchServices(searchTerm, filters = {}, page = 1, limit = 10) {
    const query = { isActive: true, ...filters };
    const skip = (page - 1) * limit;

    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
        { features: searchRegex }
      ];
    }

    const services = await Service.find(query)
      .populate('vendorId', 'businessName rating logo')
      .sort({ rating: -1, price: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(query);

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get services by location
  async getServicesByLocation(longitude, latitude, maxDistance = 50000, filters = {}, page = 1, limit = 10) {
    const query = { isActive: true, ...filters };
    const skip = (page - 1) * limit;

    const services = await Service.find({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    })
      .populate('vendorId', 'businessName rating logo')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    });

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get services by vendor
  async getServicesByVendor(vendorId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const services = await Service.find({ vendorId, isActive: true })
      .populate('vendorId', 'businessName rating logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments({ vendorId, isActive: true });

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get service by ID
  async getServiceById(serviceId) {
    const service = await Service.findById(serviceId)
      .populate('vendorId', 'businessName rating logo contactEmail contactPhone address');

    if (!service) {
      throw new Error('Service not found');
    }

    return service;
  }

  // Update service
  async updateService(serviceId, updateData, vendorId, isAdmin = false) {
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new Error('Service not found');
    }

    // Check permissions
    if (!isAdmin && service.vendorId.toString() !== vendorId) {
      throw new Error('Access denied');
    }

    Object.assign(service, updateData);
    await service.save();
    await service.populate('vendorId', 'businessName rating logo');

    return service;
  }

  // Delete service
  async deleteService(serviceId, vendorId, isAdmin = false) {
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new Error('Service not found');
    }

    // Check permissions
    if (!isAdmin && service.vendorId.toString() !== vendorId) {
      throw new Error('Access denied');
    }

    await Service.findByIdAndDelete(serviceId);

    return { message: 'Service deleted successfully' };
  }

  // Check service availability
  async checkAvailability(serviceId, date, startTime, endTime) {
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new Error('Service not found');
    }

    const isAvailable = service.isAvailableOn(date, startTime, endTime);

    return {
      available: isAvailable,
      service: {
        _id: service._id,
        name: service.name,
        duration: service.duration,
        capacity: service.capacity
      }
    };
  }

  // Get service statistics
  async getServiceStats() {
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isActive: true });

    const categoryStats = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } }
    ]);

    const priceStats = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    return {
      total: totalServices,
      active: activeServices,
      categories: categoryStats,
      priceRange: priceStats[0] || {}
    };
  }

  // Get featured/popular services
  async getFeaturedServices(limit = 10) {
    const services = await Service.find({ isActive: true })
      .populate('vendorId', 'businessName rating logo')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limit);

    return services;
  }
}

export default new ServiceService();