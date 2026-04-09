import { z } from 'zod';

// Create booking validation schema
export const createBookingSchema = z.object({
  body: z.object({
    eventId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format'),
    startTime: z.string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid start time format')
      .refine(val => new Date(val) > new Date(), 'Start time must be in the future'),
    endTime: z.string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid end time format'),
    venue: z.string()
      .min(2, 'Venue must be at least 2 characters')
      .max(200, 'Venue cannot exceed 200 characters'),
    totalPrice: z.number()
      .min(0, 'Total price cannot be negative')
      .max(1000000, 'Total price cannot exceed 1,000,000'),
    specialRequests: z.string()
      .max(500, 'Special requests cannot exceed 500 characters')
      .optional()
  }).refine(data => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime']
  })
});

// Get user bookings query validation schema
export const getUserBookingsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    eventId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    upcoming: z.enum(['true', 'false']).optional()
  })
});

// Get single booking validation schema
export const getBookingParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format')
  })
});

// Update booking validation schema
export const updateBookingSchema = z.object({
  body: z.object({
    startTime: z.string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid start time format')
      .optional(),
    endTime: z.string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid end time format')
      .optional(),
    venue: z.string()
      .min(2, 'Venue must be at least 2 characters')
      .max(200, 'Venue cannot exceed 200 characters')
      .optional(),
    specialRequests: z.string()
      .max(500, 'Special requests cannot exceed 500 characters')
      .optional()
  }).refine(data => {
    if (data.startTime && data.endTime) {
      return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
  }, {
    message: 'End time must be after start time',
    path: ['endTime']
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format')
  })
});

// Cancel booking validation schema
export const cancelBookingParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format')
  })
});

// Check venue availability validation schema
export const checkVenueAvailabilitySchema = z.object({
  body: z.object({
    venue: z.string()
      .min(2, 'Venue must be at least 2 characters')
      .max(200, 'Venue cannot exceed 200 characters'),
    startTime: z.string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid start time format'),
    endTime: z.string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid end time format'),
    excludeBookingId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
  }).refine(data => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime']
  })
});

// Get all bookings query validation schema (admin)
export const getAllBookingsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    eventId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    venue: z.string().min(1).optional(),
    dateFrom: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
    dateTo: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional()
  })
});

// Update booking status validation schema (admin)
export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed'], {
      errorMap: () => ({ message: 'Status must be pending, confirmed, cancelled, or completed' })
    })
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format')
  })
});

// Get booking admin validation schema
export const getBookingAdminParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format')
  })
});

// Get available slots query validation schema
export const getAvailableSlotsQuerySchema = z.object({
  query: z.object({
    date: z.string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid date format')
      .refine(val => {
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, 'Date must be today or in the future'),
    venue: z.string().min(1).optional()
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