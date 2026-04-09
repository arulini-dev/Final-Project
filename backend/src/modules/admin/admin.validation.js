import { z } from 'zod';

// ===== COMMON SCHEMAS =====

// Pagination query schema
const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
  limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional()
});

// Date range query schema
const dateRangeQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
});

// ===== USER MANAGEMENT SCHEMAS =====

// Get users query validation schema
export const getUsersQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    role: z.enum(['customer', 'admin', 'vendor']).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    search: z.string().min(1).optional()
  })
});

// User ID params schema
export const userIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
  })
});

// Update user validation schema
export const updateUserSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    email: z.string().email('Invalid email format').optional(),
    role: z.enum(['customer', 'admin', 'vendor']).optional(),
    isActive: z.boolean().optional(),
    phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format').optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional()
  })
});

// ===== VENDOR MANAGEMENT SCHEMAS =====

// Get vendors query validation schema
export const getVendorsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    isApproved: z.enum(['true', 'false']).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    category: z.string().min(1).optional(),
    search: z.string().min(1).optional()
  })
});

// Vendor ID params schema
export const vendorIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID format')
  })
});

// Update vendor status validation schema
export const updateVendorStatusSchema = z.object({
  body: z.object({
    isApproved: z.boolean(),
    rejectionReason: z.string().max(500, 'Rejection reason cannot exceed 500 characters').optional()
  })
});

// ===== EVENT MANAGEMENT SCHEMAS =====

// Get events query validation schema (admin view)
export const getAdminEventsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    category: z.string().min(1).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    createdBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format').optional(),
    search: z.string().min(1).optional()
  })
});

// Event ID params schema
export const eventIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format')
  })
});

// Update event status validation schema
export const updateEventStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional(),
    featured: z.boolean().optional()
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
      .min(0, 'Base price must be non-negative')
      .max(100000, 'Base price cannot exceed $100,000'),
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
      .min(0, 'Base price must be non-negative')
      .max(100000, 'Base price cannot exceed $100,000')
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
  })
});

// ===== CATEGORY MANAGEMENT SCHEMAS =====

// Create category validation schema
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Category name must be at least 2 characters')
      .max(50, 'Category name cannot exceed 50 characters'),
    description: z.string()
      .max(200, 'Description cannot exceed 200 characters')
      .optional()
  })
});

// Category ID params schema
export const categoryIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format')
  })
});

// ===== BOOKING MANAGEMENT SCHEMAS =====

// Get bookings query validation schema
export const getBookingsQuerySchema = z.object({
  query: paginationQuerySchema.extend(dateRangeQuerySchema.shape).extend({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
    eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format').optional(),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format').optional(),
    vendorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID format').optional()
  })
});

// Booking ID params schema
export const bookingIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format')
  })
});

// Update booking status validation schema
export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
    adminNotes: z.string().max(1000, 'Admin notes cannot exceed 1000 characters').optional()
  })
});

// ===== PAYMENT MANAGEMENT SCHEMAS =====

// Get payments query validation schema
export const getPaymentsQuerySchema = z.object({
  query: paginationQuerySchema.extend(dateRangeQuerySchema.shape).extend({
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format').optional(),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format').optional()
  })
});

// ===== REVIEW MANAGEMENT SCHEMAS =====

// Get reviews query validation schema
export const getReviewsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    isApproved: z.enum(['true', 'false']).optional(),
    rating: z.string().regex(/^[1-5]$/).transform(val => parseInt(val)).optional(),
    eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID format').optional(),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format').optional(),
    search: z.string().min(1).optional()
  })
});

// Review ID params schema
export const reviewIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID format')
  })
});

// Update review status validation schema
export const updateReviewStatusSchema = z.object({
  body: z.object({
    isApproved: z.boolean(),
    adminResponse: z.string().max(1000, 'Admin response cannot exceed 1000 characters').optional()
  })
});

// ===== CHAT MANAGEMENT SCHEMAS =====

// Get messages query validation schema
export const getMessagesQuerySchema = z.object({
  query: paginationQuerySchema.extend(dateRangeQuerySchema.shape).extend({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format').optional(),
    senderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format').optional(),
    isRead: z.enum(['true', 'false']).optional()
  })
});

// Message ID params schema
export const messageIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid message ID format')
  })
});