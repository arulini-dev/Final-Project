import User from './user.model.js';
import { generateToken } from '../../utils/jwt.js';

class AuthService {
  // Register a new user
  async register(userData) {
    const { name, email, password, role = 'customer' } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate token
    const token = generateToken({ id: user._id, role: user.role });

    // Return user data without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: user.createdAt
    };

    return { user: userResponse, token };
  }

  // Login user
  async login(credentials) {
    const { email, password } = credentials;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken({ id: user._id, role: user.role });

    // Return user data without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      lastLogin: user.lastLogin
    };

    return { user: userResponse, token };
  }

  // Get current user profile
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const allowedFields = ['name', 'avatar', 'phone'];
    const filteredData = {};

    // Only allow certain fields to be updated
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: user.createdAt
    };
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  // Deactivate account
  async deactivateAccount(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return { message: 'Account deactivated successfully' };
  }

  // Get all users (admin only)
  async getAllUsers(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const query = {};
    if (filters.role) query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

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

  // Update user role (admin only)
  async updateUserRole(userId, newRole, adminId) {
    if (!['customer', 'admin', 'vendor'].includes(newRole)) {
      throw new Error('Invalid role');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export default new AuthService();