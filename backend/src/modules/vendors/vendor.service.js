import Vendor from './vendor.model.js';
import User from '../auth/user.model.js';

class VendorService {
  // Create a new vendor
  async createVendor(vendorData, userId) {
    // Check if user already has a vendor account
    const existingVendor = await Vendor.findOne({ userId });
    if (existingVendor) {
      throw new Error('User already has a vendor account');
    }

    // Verify user exists and is not already a vendor
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const vendor = await Vendor.create({
      ...vendorData,
      userId
    });

    await vendor.populate('userId', 'name email avatar');

    return vendor;
  }

  // Get all vendors (admin only)
  async getAllVendors(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    const query = { ...filters };
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const vendors = await Vendor.find(query)
      .populate('userId', 'name email avatar')
      .sort(sort)
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

  // Get approved vendors (public)
  async getApprovedVendors(filters = {}, page = 1, limit = 10) {
    const query = { approved: true, isActive: true, ...filters };
    const skip = (page - 1) * limit;

    const vendors = await Vendor.find(query)
      .populate('userId', 'name email avatar')
      .sort({ rating: -1, createdAt: -1 })
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

  // Get vendors by category
  async getVendorsByCategory(category, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const vendors = await Vendor.find({
      approved: true,
      isActive: true,
      categories: category
    })
      .populate('userId', 'name email avatar')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vendor.countDocuments({
      approved: true,
      isActive: true,
      categories: category
    });

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

  // Search vendors
  async searchVendors(searchTerm, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(searchTerm, 'i');
    const query = {
      approved: true,
      isActive: true,
      $or: [
        { businessName: searchRegex },
        { description: searchRegex },
        { categories: searchRegex }
      ]
    };

    const vendors = await Vendor.find(query)
      .populate('userId', 'name email avatar')
      .sort({ rating: -1 })
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

  // Get vendor by ID
  async getVendorById(vendorId) {
    const vendor = await Vendor.findById(vendorId)
      .populate('userId', 'name email avatar');

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    return vendor;
  }

  // Get vendor by user ID
  async getVendorByUserId(userId) {
    const vendor = await Vendor.findOne({ userId })
      .populate('userId', 'name email avatar');

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    return vendor;
  }

  // Update vendor
  async updateVendor(vendorId, updateData, userId, isAdmin = false) {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Check permissions
    if (!isAdmin && vendor.userId.toString() !== userId) {
      throw new Error('Access denied');
    }

    // If updating businessName, check uniqueness
    if (updateData.businessName && updateData.businessName !== vendor.businessName) {
      const existingVendor = await Vendor.findOne({
        businessName: updateData.businessName,
        _id: { $ne: vendorId }
      });
      if (existingVendor) {
        throw new Error('Business name already exists');
      }
    }

    Object.assign(vendor, updateData);
    await vendor.save();
    await vendor.populate('userId', 'name email avatar');

    return vendor;
  }

  // Approve/Reject vendor (admin only)
  async approveVendor(vendorId, approved) {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    vendor.approved = approved;
    await vendor.save();
    await vendor.populate('userId', 'name email avatar');

    return vendor;
  }

  // Delete vendor
  async deleteVendor(vendorId, userId, isAdmin = false) {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Check permissions
    if (!isAdmin && vendor.userId.toString() !== userId) {
      throw new Error('Access denied');
    }

    await Vendor.findByIdAndDelete(vendorId);

    return { message: 'Vendor deleted successfully' };
  }

  // Get vendor statistics (admin only)
  async getVendorStats() {
    const totalVendors = await Vendor.countDocuments();
    const approvedVendors = await Vendor.countDocuments({ approved: true });
    const pendingVendors = await Vendor.countDocuments({ approved: false });
    const activeVendors = await Vendor.countDocuments({ approved: true, isActive: true });

    const categoryStats = await Vendor.aggregate([
      { $match: { approved: true, isActive: true } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return {
      total: totalVendors,
      approved: approvedVendors,
      pending: pendingVendors,
      active: activeVendors,
      categories: categoryStats
    };
  }
}

export default new VendorService();