import { z } from 'zod';

// Create review validation schema
export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format'),
    rating: z.number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot be more than 5'),
    comment: z.string()
      .min(10, 'Comment must be at least 10 characters')
      .max(500, 'Comment cannot exceed 500 characters')
  })
});

// Get event reviews query validation schema
export const getEventReviewsQuerySchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format')
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    rating: z.string().regex(/^[1-5]$/).transform(val => parseInt(val)).optional(),
    minRating: z.string().regex(/^[1-5]$/).transform(val => parseInt(val)).optional(),
    maxRating: z.string().regex(/^[1-5]$/).transform(val => parseInt(val)).optional(),
    sortBy: z.enum(['createdAt', 'rating']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});

// Get user reviews query validation schema
export const getUserReviewsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional()
  })
});

// Get single review validation schema
export const getReviewParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID format')
  })
});

// Update review validation schema
export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot be more than 5')
      .optional(),
    comment: z.string()
      .min(10, 'Comment must be at least 10 characters')
      .max(500, 'Comment cannot exceed 500 characters')
      .optional()
  }).refine(data => data.rating !== undefined || data.comment !== undefined, {
    message: 'At least one field (rating or comment) must be provided'
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID format')
  })
});

// Delete review validation schema
export const deleteReviewParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID format')
  })
});

// Check can review validation schema
export const checkCanReviewParamsSchema = z.object({
  params: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format')
  })
});

// Get all reviews query validation schema (admin)
export const getAllReviewsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    rating: z.string().regex(/^[1-5]$/).transform(val => parseInt(val)).optional(),
    eventId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    dateFrom: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
    dateTo: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional()
  })
});

// Get review admin validation schema
export const getReviewAdminParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID format')
  })
});

// Delete review admin validation schema
export const deleteReviewAdminParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID format')
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