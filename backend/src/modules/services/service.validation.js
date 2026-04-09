import { z } from 'zod';

// Base service validation schema
export const createServiceSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Service name must be at least 2 characters')
      .max(100, 'Service name cannot exceed 100 characters'),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative'),
    category: z.enum(['catering', 'decoration', 'entertainment', 'photography', 'venue', 'transportation', 'other']),
    images: z.array(z.string().url('Please provide a valid image URL'))
      .max(10, 'Maximum 10 images allowed')
      .optional(),
    duration: z.number()
      .min(0.5, 'Duration must be at least 0.5 hours')
      .max(24, 'Duration cannot exceed 24 hours')
      .optional(),
    capacity: z.number()
      .min(1, 'Capacity must be at least 1')
      .optional(),
    location: z.object({
      coordinates: z.array(z.number())
        .length(2, 'Coordinates must be [longitude, latitude]'),
      address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().default('USA')
      }).optional()
    }),
    availability: z.object({
      daysOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
        .min(1, 'At least one day must be selected'),
      timeSlots: z.array(z.object({
        startTime: z.string()
          .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format'),
        endTime: z.string()
          .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format')
      }))
        .min(1, 'At least one time slot must be provided'),
      blackoutDates: z.array(z.string().transform(val => new Date(val)))
        .optional(),
      advanceBookingDays: z.number()
        .min(0, 'Advance booking days cannot be negative')
        .default(0)
    }).optional(),
    features: z.array(z.string().max(50, 'Feature name cannot exceed 50 characters'))
      .max(20, 'Maximum 20 features allowed')
      .optional(),
    requirements: z.array(z.string().max(100, 'Requirement cannot exceed 100 characters'))
      .max(10, 'Maximum 10 requirements allowed')
      .optional(),
    tags: z.array(z.string().max(30, 'Tag cannot exceed 30 characters'))
      .max(10, 'Maximum 10 tags allowed')
      .optional()
  })
});

export const updateServiceSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Service name must be at least 2 characters')
      .max(100, 'Service name cannot exceed 100 characters')
      .optional(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .optional(),
    category: z.enum(['catering', 'decoration', 'entertainment', 'photography', 'venue', 'transportation', 'other'])
      .optional(),
    images: z.array(z.string().url('Please provide a valid image URL'))
      .max(10, 'Maximum 10 images allowed')
      .optional(),
    duration: z.number()
      .min(0.5, 'Duration must be at least 0.5 hours')
      .max(24, 'Duration cannot exceed 24 hours')
      .optional(),
    capacity: z.number()
      .min(1, 'Capacity must be at least 1')
      .optional(),
    location: z.object({
      coordinates: z.array(z.number())
        .length(2, 'Coordinates must be [longitude, latitude]'),
      address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().default('USA')
      }).optional()
    }).optional(),
    availability: z.object({
      daysOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
        .min(1, 'At least one day must be selected'),
      timeSlots: z.array(z.object({
        startTime: z.string()
          .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format'),
        endTime: z.string()
          .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format')
      }))
        .min(1, 'At least one time slot must be provided'),
      blackoutDates: z.array(z.string().transform(val => new Date(val)))
        .optional(),
      advanceBookingDays: z.number()
        .min(0, 'Advance booking days cannot be negative')
        .default(0)
    }).optional(),
    features: z.array(z.string().max(50, 'Feature name cannot exceed 50 characters'))
      .max(20, 'Maximum 20 features allowed')
      .optional(),
    requirements: z.array(z.string().max(100, 'Requirement cannot exceed 100 characters'))
      .max(10, 'Maximum 10 requirements allowed')
      .optional(),
    tags: z.array(z.string().max(30, 'Tag cannot exceed 30 characters'))
      .max(10, 'Maximum 10 tags allowed')
      .optional(),
    isActive: z.boolean().optional()
  })
});

export const serviceIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID')
  })
});

export const serviceQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).default('1'),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).default('10'),
    category: z.enum(['catering', 'decoration', 'entertainment', 'photography', 'venue', 'transportation', 'other']).optional(),
    minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(val => parseFloat(val)).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(val => parseFloat(val)).optional(),
    search: z.string().optional(),
    vendorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    longitude: z.string().regex(/^-?\d+(\.\d+)?$/).transform(val => parseFloat(val)).optional(),
    latitude: z.string().regex(/^-?\d+(\.\d+)?$/).transform(val => parseFloat(val)).optional(),
    maxDistance: z.string().regex(/^\d+$/).transform(val => parseInt(val)).default('50000'),
    tags: z.string().optional(), // comma-separated
    sortBy: z.enum(['rating', 'price', 'createdAt', 'name']).default('rating'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  })
});

export const checkAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID')
  }),
  body: z.object({
    date: z.string().transform(val => new Date(val)),
    startTime: z.string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format'),
    endTime: z.string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format')
  })
});