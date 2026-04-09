import { z } from 'zod';

// Base vendor validation schema
export const createVendorSchema = z.object({
  body: z.object({
    businessName: z.string()
      .min(2, 'Business name must be at least 2 characters')
      .max(100, 'Business name cannot exceed 100 characters'),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    contactEmail: z.string()
      .email('Please provide a valid email')
      .optional(),
    contactPhone: z.string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number')
      .optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().default('USA')
    }).optional(),
    website: z.string()
      .url('Please provide a valid URL')
      .optional(),
    logo: z.string()
      .url('Please provide a valid URL')
      .optional(),
    categories: z.array(z.enum(['catering', 'decoration', 'entertainment', 'photography', 'venue', 'transportation', 'other']))
      .min(1, 'At least one category is required')
      .max(5, 'Maximum 5 categories allowed')
  })
});

export const updateVendorSchema = z.object({
  body: z.object({
    businessName: z.string()
      .min(2, 'Business name must be at least 2 characters')
      .max(100, 'Business name cannot exceed 100 characters')
      .optional(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    contactEmail: z.string()
      .email('Please provide a valid email')
      .optional(),
    contactPhone: z.string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number')
      .optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().default('USA')
    }).optional(),
    website: z.string()
      .url('Please provide a valid URL')
      .optional(),
    logo: z.string()
      .url('Please provide a valid URL')
      .optional(),
    categories: z.array(z.enum(['catering', 'decoration', 'entertainment', 'photography', 'venue', 'transportation', 'other']))
      .min(1, 'At least one category is required')
      .max(5, 'Maximum 5 categories allowed')
      .optional(),
    isActive: z.boolean().optional()
  })
});

export const vendorIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID')
  })
});

export const vendorQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).default('1'),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).default('10'),
    category: z.enum(['catering', 'decoration', 'entertainment', 'photography', 'venue', 'transportation', 'other']).optional(),
    search: z.string().optional(),
    approved: z.string().transform(val => val === 'true').optional(),
    sortBy: z.enum(['rating', 'createdAt', 'businessName']).default('rating'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  })
});

export const approveVendorSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID')
  }),
  body: z.object({
    approved: z.boolean()
  })
});