# Payment Module Documentation

## Overview
The Payment module integrates Stripe payment processing into the Surprise Event Management System. It handles the complete payment flow from booking creation to payment confirmation via webhooks.

## Features
- Stripe Checkout integration
- Secure payment processing
- Webhook handling for payment confirmation
- Payment status tracking
- Refund processing
- Payment analytics and reporting

## Payment Flow

### 1. Create Booking
- User creates a booking for an event
- Booking status is set to 'confirmed'

### 2. Create Checkout Session
- User initiates payment for the booking
- System creates Stripe checkout session
- User is redirected to Stripe's secure checkout page

### 3. Payment Processing
- User completes payment on Stripe
- Stripe processes the payment
- Webhook notifies the system of payment completion

### 4. Update Booking Status
- System receives webhook confirmation
- Payment status updated to 'succeeded'
- Booking status updated to 'paid'

## Database Schema

### Payment Model
```javascript
{
  bookingId: ObjectId (ref: 'Booking', unique),
  userId: ObjectId (ref: 'User'),
  vendorId: ObjectId (ref: 'Vendor'),
  amount: Number,
  currency: String (default: 'usd'),
  stripeSessionId: String (unique),
  stripePaymentIntentId: String,
  status: String (enum: pending, processing, succeeded, failed, canceled, refunded),
  paymentMethod: String (enum: card, bank_transfer, other),
  metadata: Mixed,
  refundedAmount: Number,
  refundReason: String,
  failureReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public Endpoints
- `GET /api/payments/session-status` - Get checkout session status

### Protected Endpoints (Customer)
- `POST /api/payments/create-checkout-session` - Create payment session
- `GET /api/payments/my-payments` - Get user's payment history
- `GET /api/payments/:id` - Get payment details

### Vendor Endpoints
- `GET /api/payments/vendor/payments` - Get vendor's received payments

### Admin Endpoints
- `GET /api/payments/admin/all` - Get all payments
- `POST /api/payments/:id/refund` - Process refund
- `GET /api/payments/admin/stats` - Get payment statistics
- `GET /api/payments/:id/verify` - Verify payment status with Stripe

### Webhook Endpoint
- `POST /api/payments/webhook` - Stripe webhook handler

## Environment Variables

Add these to your `.env` file:

```env
# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Usage Examples

### Create Checkout Session
```javascript
POST /api/payments/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "60d5ecb74b24c72b8c8b4567",
  "successUrl": "http://localhost:3000/payment/success",
  "cancelUrl": "http://localhost:3000/payment/cancel"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "sessionId": "cs_test_...",
    "sessionUrl": "https://checkout.stripe.com/...",
    "paymentId": "60d5ecb74b24c72b8c8b4567"
  }
}
```

### Frontend Integration
```javascript
// Redirect user to Stripe Checkout
const { sessionUrl } = await createCheckoutSession(bookingId);
window.location.href = sessionUrl;
```

### Handle Success/Cancel Redirects
```javascript
// Success page - verify payment status
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

const response = await fetch(`/api/payments/session-status?session_id=${sessionId}`);
const { data } = await response.json();

if (data.paymentStatus === 'paid') {
  // Payment successful
  navigate('/booking/confirmed');
} else {
  // Payment failed
  navigate('/payment/failed');
}
```

### Webhook Configuration

1. **Stripe Dashboard Setup:**
   - Go to Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/webhook`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

2. **Webhook Secret:**
   - Copy the webhook signing secret
   - Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### Process Refund (Admin)
```javascript
POST /api/payments/60d5ecb74b24c72b8c8b4567/refund
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "amount": 50.00,
  "reason": "Customer requested cancellation"
}
```

## Security Features

### Webhook Verification
- All webhooks are verified using Stripe's signature
- Invalid signatures are rejected with 400 error

### Payment Validation
- Bookings must be confirmed before payment
- One payment per booking enforced
- User must own the booking

### Access Control
- Users can only view their own payments
- Vendors can view payments for their services
- Admins have full access

## Payment Statuses

### Payment Status Flow
```
pending → processing → succeeded
    ↓         ↓
 failed    canceled
    ↓         ↓
 refunded
```

### Booking Status Updates
- `confirmed` → `paid` (on successful payment)
- `paid` → `refunded` (on full refund)

## Error Handling

### Common Errors
- **Booking not found**: Invalid booking ID or access denied
- **Payment already exists**: Booking already has a payment
- **Invalid amount**: Amount must be > 0
- **Webhook verification failed**: Invalid Stripe signature

### Error Responses
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "bookingId",
      "message": "Invalid booking ID"
    }
  ]
}
```

## Testing

### Stripe Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Require authentication**: `4000 0025 0000 3155`

### Webhook Testing
Use Stripe CLI for local webhook testing:
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

## Analytics & Reporting

### Payment Statistics
- Total payments and revenue
- Success/failure rates
- Monthly revenue trends
- Payment method breakdown

### Available Metrics
```javascript
{
  total: 1250,
  successful: 1200,
  failed: 25,
  refunded: 25,
  totalRevenue: 75000.00,
  monthlyRevenue: 8500.00
}
```

## Best Practices

### Frontend Integration
1. Always verify payment status on success page
2. Handle both success and cancel redirects
3. Show loading states during payment processing
4. Store session ID for status verification

### Backend Security
1. Validate all payment requests
2. Use HTTPS for webhook endpoints
3. Store sensitive data securely
4. Implement proper error logging

### User Experience
1. Clear payment flow communication
2. Multiple payment method support
3. Transparent pricing and fees
4. Easy refund process

## Troubleshooting

### Common Issues
- **Webhook not firing**: Check endpoint URL and events
- **Payment not updating**: Verify webhook secret and signature
- **Duplicate payments**: Check booking status before payment
- **Refund failures**: Ensure payment is successful and not already refunded

### Debug Mode
Enable Stripe debug logging:
```javascript
// In payment service
console.log('Stripe event:', event);
```

## Migration Notes

If upgrading from existing payment system:
1. Backup existing payment data
2. Update booking schema for paymentId reference
3. Migrate payment statuses
4. Test webhook endpoints thoroughly
5. Update frontend payment flows