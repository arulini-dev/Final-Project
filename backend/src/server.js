import app from './app.js';
import connectDB from './config/database.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Message from './modules/chat/message.model.js';
import Booking from './modules/bookings/booking.model.js';
import jwt from 'jsonwebtoken';

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Authenticate user
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      connectedUsers.set(socket.userId, socket.id);
      console.log(`User ${socket.userId} authenticated`);
    } catch (error) {
      socket.emit('authentication_error', { message: 'Invalid token' });
      socket.disconnect();
    }
  });

  // Join room for chat (booking-specific)
  socket.on('join_room', async (bookingId) => {
    try {
      if (!socket.userId) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      // Verify user has access to this booking
      const booking = await Booking.findOne({
        _id: bookingId,
        $or: [
          { userId: socket.userId }, // User owns the booking
          { 'vendorId': socket.userId } // Vendor is assigned (if we add vendorId later)
        ]
      });

      if (!booking) {
        socket.emit('error', { message: 'Access denied to this chat' });
        return;
      }

      socket.join(bookingId);
      console.log(`User ${socket.userId} joined room ${bookingId}`);

      // Send confirmation
      socket.emit('joined_room', { bookingId });

      // Mark messages as read for this user
      await Message.markAsRead(bookingId, socket.userId);

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle chat messages
  socket.on('send_message', async (data) => {
    try {
      const { bookingId, message, messageType = 'text' } = data;

      if (!socket.userId) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      if (!message || message.trim().length === 0) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      // Verify user has access to this booking
      const booking = await Booking.findOne({
        _id: bookingId,
        $or: [
          { userId: socket.userId },
          { 'vendorId': socket.userId }
        ]
      });

      if (!booking) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Save message to database
      const newMessage = await Message.create({
        bookingId,
        senderId: socket.userId,
        message: message.trim(),
        messageType
      });

      // Populate sender info
      await newMessage.populate('senderId', 'name email avatar');

      // Emit to all users in the room (including sender)
      io.to(bookingId).emit('receive_message', {
        _id: newMessage._id,
        bookingId: newMessage.bookingId,
        senderId: newMessage.senderId,
        message: newMessage.message,
        messageType: newMessage.messageType,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt,
        sender: {
          _id: newMessage.senderId._id,
          name: newMessage.senderId.name,
          email: newMessage.senderId.email,
          avatar: newMessage.senderId.avatar
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { bookingId } = data;
    socket.to(bookingId).emit('user_typing', {
      userId: socket.userId,
      bookingId
    });
  });

  socket.on('stop_typing', (data) => {
    const { bookingId } = data;
    socket.to(bookingId).emit('user_stop_typing', {
      userId: socket.userId,
      bookingId
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to Uncaught Exception');
  process.exit(1);
});

export { io };