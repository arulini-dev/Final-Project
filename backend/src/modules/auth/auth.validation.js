import { z } from 'zod';

// Register validation schema
export const registerSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string()
      .email('Please provide a valid email'),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    role: z.enum(['customer', 'admin', 'vendor']).optional().default('customer'),
    phone: z.string().optional(),
    avatar: z.string().url().optional()
  })
});

// Login validation schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Please provide a valid email'),
    password: z.string()
      .min(1, 'Password is required')
  })
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    phone: z.string()
      .max(20, 'Phone number cannot exceed 20 characters')
      .optional(),
    avatar: z.string()
      .url('Please provide a valid URL for avatar')
      .optional()
  })
});

// Change password validation schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(1, 'Current password is required'),
    newPassword: z.string()
      .min(6, 'New password must be at least 6 characters')
      .max(100, 'New password cannot exceed 100 characters')
  })
});

// Update user role validation schema (admin only)
export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['customer', 'admin', 'vendor'], {
      errorMap: () => ({ message: 'Role must be customer, admin, or vendor' })
    })
  }),
  params: z.object({
    id: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
  })
});

// Get users query validation schema
export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    role: z.enum(['customer', 'admin', 'vendor']).optional(),
    isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional()
  })
});

// Middleware function to validate requests
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
  };
};