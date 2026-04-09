import chatService from './chat.service.js';
import asyncWrapper from '../../middleware/asyncWrapper.js';

class ChatController {
  // Get messages for a booking
  getBookingMessages = asyncWrapper(async (req, res) => {
    const { bookingId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    const result = await chatService.getBookingMessages(
      bookingId,
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get user's chat list
  getUserChats = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const result = await chatService.getUserChats(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Mark messages as read
  markMessagesAsRead = asyncWrapper(async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const result = await chatService.markMessagesAsRead(bookingId, userId);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get unread message count
  getUnreadCount = asyncWrapper(async (req, res) => {
    const userId = req.user.id;

    const result = await chatService.getUnreadCount(userId);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Delete message
  deleteMessage = asyncWrapper(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await chatService.deleteMessage(messageId, userId, isAdmin);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });
}

export default new ChatController();