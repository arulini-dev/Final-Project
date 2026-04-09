import serviceService from './service.service.js';
import asyncWrapper from '../../middleware/asyncWrapper.js';

class ServiceController {
  // Create a new service
  createService = asyncWrapper(async (req, res) => {
    // Get vendor ID from authenticated user
    const vendor = await require('../vendors/vendor.service.js').default.getVendorByUserId(req.user.id);
    const service = await serviceService.createService(req.body, vendor._id);

    res.status(201).json({
      status: 'success',
      data: service
    });
  });

  // Get all services with filters
  getServices = asyncWrapper(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      search,
      vendorId,
      longitude,
      latitude,
      maxDistance = 50000,
      tags,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    if (minPrice !== undefined) filters.price = { $gte: minPrice };
    if (maxPrice !== undefined) {
      filters.price = { ...filters.price, $lte: maxPrice };
    }
    if (vendorId) filters.vendorId = vendorId;
    if (tags) filters.tags = { $in: tags.split(',') };

    let result;
    if (longitude && latitude) {
      result = await serviceService.getServicesByLocation(
        parseFloat(longitude),
        parseFloat(latitude),
        parseInt(maxDistance),
        filters,
        parseInt(page),
        parseInt(limit)
      );
    } else if (search) {
      result = await serviceService.searchServices(search, filters, parseInt(page), parseInt(limit));
    } else if (category) {
      result = await serviceService.getServicesByCategory(category, filters, parseInt(page), parseInt(limit));
    } else {
      result = await serviceService.getServices(filters, parseInt(page), parseInt(limit), sortBy, sortOrder);
    }

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get services by vendor
  getServicesByVendor = asyncWrapper(async (req, res) => {
    const { vendorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await serviceService.getServicesByVendor(
      vendorId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get service by ID
  getServiceById = asyncWrapper(async (req, res) => {
    const service = await serviceService.getServiceById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: service
    });
  });

  // Get my services (vendor only)
  getMyServices = asyncWrapper(async (req, res) => {
    const vendor = await require('../vendors/vendor.service.js').default.getVendorByUserId(req.user.id);
    const { page = 1, limit = 10 } = req.query;

    const result = await serviceService.getServicesByVendor(
      vendor._id,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Update service
  updateService = asyncWrapper(async (req, res) => {
    const vendor = await require('../vendors/vendor.service.js').default.getVendorByUserId(req.user.id);
    const service = await serviceService.updateService(
      req.params.id,
      req.body,
      vendor._id,
      req.user.role === 'admin'
    );

    res.status(200).json({
      status: 'success',
      data: service
    });
  });

  // Delete service
  deleteService = asyncWrapper(async (req, res) => {
    const vendor = await require('../vendors/vendor.service.js').default.getVendorByUserId(req.user.id);
    const result = await serviceService.deleteService(
      req.params.id,
      vendor._id,
      req.user.role === 'admin'
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Check service availability
  checkAvailability = asyncWrapper(async (req, res) => {
    const { date, startTime, endTime } = req.body;
    const result = await serviceService.checkAvailability(req.params.id, date, startTime, endTime);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get service statistics (admin only)
  getServiceStats = asyncWrapper(async (req, res) => {
    const stats = await serviceService.getServiceStats();

    res.status(200).json({
      status: 'success',
      data: stats
    });
  });

  // Get featured services
  getFeaturedServices = asyncWrapper(async (req, res) => {
    const { limit = 10 } = req.query;
    const services = await serviceService.getFeaturedServices(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: services
    });
  });
}

export default new ServiceController();