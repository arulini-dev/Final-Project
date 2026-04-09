import authService from './auth.service.js';
import asyncWrapper from '../../middleware/asyncWrapper.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncWrapper(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password'
    });
  }

  const result = await authService.register({ name, email, password, role });

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncWrapper(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncWrapper(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncWrapper(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current password and new password'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters'
    });
  }

  const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Deactivate account
// @route   DELETE /api/auth/deactivate
// @access  Private
export const deactivateAccount = asyncWrapper(async (req, res) => {
  const result = await authService.deactivateAccount(req.user.id);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filters = {};

  if (req.query.role) filters.role = req.query.role;
  if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

  const result = await authService.getAllUsers(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncWrapper(async (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a role'
    });
  }

  const user = await authService.updateUserRole(req.params.id, role, req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});