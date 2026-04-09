import { z } from 'zod';

// Get events query validation schema
export const getEventsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    category: z.enum(['wedding', 'birthday', 'corporate', 'anniversary', 'other']).optional(),
    minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(val => parseFloat(val)).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(val => parseFloat(val)).optional(),
    search: z.string().min(1).optional(),
    sortBy: z.enum(['createdAt', 'basePrice', 'averageRating', 'title']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});

// Get single event validation schema
export const getEventParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format')
  })
});

// Create event validation schema
export const createEventSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters'),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description cannot exceed 1000 characters'),
    basePrice: z.number()
      .min(0, 'Base price cannot be negative')
      .max(100000, 'Base price cannot exceed 100,000'),
    category: z.enum(['wedding', 'birthday', 'corporate', 'anniversary', 'other'], {
      errorMap: () => ({ message: 'Category must be one of: wedding, birthday, corporate, anniversary, other' })
    }),
    date: z.string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
      .refine((date) => new Date(date) > new Date(), 'Event date must be in the future'),
    location: z.string()
      .min(3, 'Location must be at least 3 characters')
      .max(200, 'Location cannot exceed 200 characters'),
    capacity: z.number()
      .min(1, 'Capacity must be at least 1')
      .max(10000, 'Capacity cannot exceed 10,000'),
    availableSpots: z.number()
      .min(0, 'Available spots cannot be negative'),
    status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
    images: z.array(z.string().url('Each image must be a valid URL')).max(10, 'Cannot have more than 10 images').optional(),
    featured: z.boolean().optional()
  })
});

// Update event validation schema
export const updateEventSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters')
      .optional(),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    basePrice: z.number()
      .min(0, 'Base price cannot be negative')
      .max(100000, 'Base price cannot exceed 100,000')
      .optional(),
    category: z.enum(['wedding', 'birthday', 'corporate', 'anniversary', 'other'], {
      errorMap: () => ({ message: 'Category must be one of: wedding, birthday, corporate, anniversary, other' })
    }).optional(),
    date: z.string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
      .optional(),
    location: z.string()
      .min(3, 'Location must be at least 3 characters')
      .max(200, 'Location cannot exceed 200 characters')
      .optional(),
    capacity: z.number()
      .min(1, 'Capacity must be at least 1')
      .max(10000, 'Capacity cannot exceed 10,000')
      .optional(),
    availableSpots: z.number()
      .min(0, 'Available spots cannot be negative')
      .optional(),
    status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
    images: z.array(z.string().url('Each image must be a valid URL')).max(10, 'Cannot have more than 10 images').optional(),
    isActive: z.boolean().optional(),
    featured: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format')
  })
});

// Delete event validation schema
export const deleteEventParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format')
  })
});

// Get events by category validation schema
export const getEventsByCategorySchema = z.object({
  params: z.object({
    category: z.enum(['wedding', 'birthday', 'corporate', 'anniversary', 'other'], {
      errorMap: () => ({ message: 'Invalid category' })
    })
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional()
  })
});

// Search events validation schema
export const searchEventsQuerySchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search term is required'),
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional()
  })
});

// Get featured events validation schema
export const getFeaturedEventsQuerySchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).refine(val => val <= 20, 'Limit cannot exceed 20').optional()
  })
});

// Bulk update events validation schema
export const bulkUpdateEventsSchema = z.object({
  body: z.object({
    eventIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format'))
      .min(1, 'At least one event ID is required')
      .max(50, 'Cannot update more than 50 events at once'),
    updateData: z.object({
      isActive: z.boolean().optional(),
      category: z.enum(['wedding', 'birthday', 'corporate', 'anniversary', 'other']).optional()
    }).refine(data => Object.keys(data).length > 0, 'At least one field must be provided for update')
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