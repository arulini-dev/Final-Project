import Message from './message.model.js';
import Booking from '../bookings/booking.model.js';

class ChatService {
  // Get messages for a booking
  async getBookingMessages(bookingId, userId, page = 1, limit = 50) {
    // Verify user has access to this booking
    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [
        { userId },
        { 'vendorId': userId } // For future vendor support
      ]
    });

    if (!booking) {
      throw new Error('Access denied to this chat');
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ bookingId })
      .populate('senderId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 }); // Re-sort for chronological order

    const total = await Message.countDocuments({ bookingId });

    // Mark messages as read
    await Message.markAsRead(bookingId, userId);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get chat list for user (bookings with messages)
  async getUserChats(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Find bookings where user is involved and has messages
    const bookingsWithMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { bookingId: { $in: await Booking.find({ userId }).distinct('_id') } }
          ]
        }
      },
      {
        $group: {
          _id: '$bookingId',
          lastMessage: { $last: '$$ROOT' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$senderId', userId] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Populate booking and last message sender info
    const chatList = await Promise.all(
      bookingsWithMessages.map(async (chat) => {
        const booking = await Booking.findById(chat._id)
          .populate('eventId', 'title category')
          .populate('userId', 'name email');

        const lastMessage = await Message.findById(chat.lastMessage._id)
          .populate('senderId', 'name');

        return {
          bookingId: chat._id,
          booking: {
            _id: booking._id,
            event: booking.eventId,
            startTime: booking.startTime,
            venue: booking.venue,
            status: booking.status
          },
          lastMessage: {
            _id: lastMessage._id,
            message: lastMessage.message,
            sender: lastMessage.senderId,
            createdAt: lastMessage.createdAt
          },
          messageCount: chat.messageCount,
          unreadCount: chat.unreadCount
        };
      })
    );

    return {
      chats: chatList,
      pagination: {
        page,
        limit,
        total: bookingsWithMessages.length,
        pages: Math.ceil(bookingsWithMessages.length / limit)
      }
    };
  }

  // Mark messages as read
  async markMessagesAsRead(bookingId, userId) {
    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [
        { userId },
        { 'vendorId': userId }
      ]
    });

    if (!booking) {
      throw new Error('Access denied to this chat');
    }

    const result = await Message.markAsRead(bookingId, userId);

    return { message: 'Messages marked as read', modifiedCount: result.modifiedCount };
  }

  // Get unread message count for user
  async getUnreadCount(userId) {
    // Get all booking IDs for this user
    const userBookingIds = await Booking.find({
      $or: [
        { userId },
        { 'vendorId': userId }
      ]
    }).distinct('_id');

    const unreadCount = await Message.countDocuments({
      bookingId: { $in: userBookingIds },
      senderId: { $ne: userId },
      isRead: false
    });

    return { unreadCount };
  }

  // Delete message (admin only or sender)
  async deleteMessage(messageId, userId, isAdmin = false) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    // Check permissions
    if (!isAdmin && message.senderId.toString() !== userId) {
      throw new Error('Access denied');
    }

    await Message.findByIdAndDelete(messageId);

    return { message: 'Message deleted successfully' };
  }
}

export default new ChatService();