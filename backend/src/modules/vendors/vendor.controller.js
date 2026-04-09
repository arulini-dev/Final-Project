import vendorService from './vendor.service.js';
import asyncWrapper from '../../middleware/asyncWrapper.js';

class VendorController {
  // Create a new vendor
  createVendor = asyncWrapper(async (req, res) => {
    const vendor = await vendorService.createVendor(req.body, req.user.id);

    res.status(201).json({
      status: 'success',
      data: vendor
    });
  });

  // Get all vendors (admin only)
  getAllVendors = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 10, approved, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filters = {};
    if (approved !== undefined) {
      filters.approved = approved === 'true';
    }

    const result = await vendorService.getAllVendors(
      filters,
      parseInt(page),
      parseInt(limit),
      sortBy,
      sortOrder
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get approved vendors (public)
  getApprovedVendors = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 10, category, search } = req.query;

    let filters = {};
    if (category) {
      filters.categories = category;
    }

    let result;
    if (search) {
      result = await vendorService.searchVendors(search, parseInt(page), parseInt(limit));
    } else if (category) {
      result = await vendorService.getVendorsByCategory(category, parseInt(page), parseInt(limit));
    } else {
      result = await vendorService.getApprovedVendors(filters, parseInt(page), parseInt(limit));
    }

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get vendor by ID
  getVendorById = asyncWrapper(async (req, res) => {
    const vendor = await vendorService.getVendorById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: vendor
    });
  });

  // Get current user's vendor profile
  getMyVendor = asyncWrapper(async (req, res) => {
    const vendor = await vendorService.getVendorByUserId(req.user.id);

    res.status(200).json({
      status: 'success',
      data: vendor
    });
  });

  // Update vendor
  updateVendor = asyncWrapper(async (req, res) => {
    const vendor = await vendorService.updateVendor(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role === 'admin'
    );

    res.status(200).json({
      status: 'success',
      data: vendor
    });
  });

  // Approve/Reject vendor (admin only)
  approveVendor = asyncWrapper(async (req, res) => {
    const vendor = await vendorService.approveVendor(req.params.id, req.body.approved);

    res.status(200).json({
      status: 'success',
      data: vendor
    });
  });

  // Delete vendor
  deleteVendor = asyncWrapper(async (req, res) => {
    const result = await vendorService.deleteVendor(
      req.params.id,
      req.user.id,
      req.user.role === 'admin'
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get vendor statistics (admin only)
  getVendorStats = asyncWrapper(async (req, res) => {
    const stats = await vendorService.getVendorStats();

    res.status(200).json({
      status: 'success',
      data: stats
    });
  });
}

export default new VendorController();