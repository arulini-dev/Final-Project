import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  getAllUsers,
  updateUserRole
} from './auth.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateUserRoleSchema,
  getUsersQuerySchema
} from './auth.validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);
router.delete('/deactivate', protect, deactivateAccount);

// Admin only routes
router.get('/users', protect, authorize('admin'), validate(getUsersQuerySchema), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), validate(updateUserRoleSchema), updateUserRole);

export default router;