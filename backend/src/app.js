import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import middleware
import errorHandler from './middleware/errorHandler.js';

// Import routes (to be added later)
import authRoutes from './modules/auth/auth.routes.js';
import eventRoutes from './modules/events/event.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import vendorRoutes from './modules/vendors/vendor.routes.js';
import serviceRoutes from './modules/services/service.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;