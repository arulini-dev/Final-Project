import express from 'express';
import chatController from './chat.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Get user's chat list
router.get('/', chatController.getUserChats);

// Get unread message count
router.get('/unread-count', chatController.getUnreadCount);

// Get messages for a specific booking
router.get('/:bookingId/messages', chatController.getBookingMessages);

// Mark messages as read for a booking
router.patch('/:bookingId/read', chatController.markMessagesAsRead);

// Delete a message (admin or sender only)
router.delete('/messages/:messageId', chatController.deleteMessage);

export default router;