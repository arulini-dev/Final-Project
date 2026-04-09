import { z } from 'zod';

// Create checkout session validation schema
export const createCheckoutSessionSchema = z.object({
  body: z.object({
    bookingId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
    successUrl: z.string()
      .url('Please provide a valid success URL'),
    cancelUrl: z.string()
      .url('Please provide a valid cancel URL')
  })
});

// Payment ID validation schema
export const paymentIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID')
  })
});

// Payment query validation schema
export const paymentQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).default('1'),
    limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).default('10'),
    status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded']).optional(),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    vendorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional()
  })
});

// Refund payment validation schema
export const refundPaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID')
  }),
  body: z.object({
    amount: z.number()
      .min(0.01, 'Refund amount must be at least $0.01'),
    reason: z.string()
      .max(500, 'Refund reason cannot exceed 500 characters')
      .optional()
  })
});

// Webhook validation schema (for Stripe webhook)
export const stripeWebhookSchema = z.object({
  headers: z.object({
    'stripe-signature': z.string()
  }),
  body: z.any() // Stripe webhook body is raw
});