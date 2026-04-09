# Chat Module Documentation

## Overview
The chat module provides real-time messaging functionality for bookings in the Surprise Event Management System. Users can communicate with each other regarding their bookings using Socket.IO for real-time communication and MongoDB for message persistence.

## Features
- Real-time messaging per booking
- Message persistence in MongoDB
- Typing indicators
- Message read status
- REST API for message history
- Access control (only booking participants can chat)
- Support for text, image, and file messages

## Socket.IO Events

### Authentication
- `authenticate` (client → server): Authenticate user with JWT token
  ```javascript
  socket.emit('authenticate', token);
  ```

### Joining Chat Room
- `join_room` (client → server): Join a booking-specific chat room
  ```javascript
  socket.emit('join_room', bookingId);
  ```
- `joined_room` (server → client): Confirmation of room join
- `error` (server → client): Error messages

### Sending Messages
- `send_message` (client → server): Send a message
  ```javascript
  socket.emit('send_message', {
    bookingId: 'booking_id',
    message: 'Hello!',
    messageType: 'text' // optional, defaults to 'text'
  });
  ```
- `receive_message` (server → client): Receive a message
  ```javascript
  socket.on('receive_message', (messageData) => {
    console.log(messageData);
    // {
    //   _id: 'message_id',
    //   bookingId: 'booking_id',
    //   senderId: 'user_id',
    //   message: 'Hello!',
    //   messageType: 'text',
    //   isRead: false,
    //   createdAt: 'timestamp',
    //   sender: { _id, name, email, avatar }
    // }
  });
  ```

### Typing Indicators
- `typing` (client → server): Indicate user is typing
  ```javascript
  socket.emit('typing', { bookingId: 'booking_id' });
  ```
- `user_typing` (server → client): Notify other users of typing
- `stop_typing` (client → server): Stop typing indicator
- `user_stop_typing` (server → client): Notify users typing stopped

## REST API Endpoints

### Get User's Chat List
- **GET** `/api/chat`
- **Auth**: Required
- **Query**: `page=1&limit=10`
- Returns list of bookings with recent messages

### Get Unread Message Count
- **GET** `/api/chat/unread-count`
- **Auth**: Required
- Returns total unread messages count

### Get Booking Messages
- **GET** `/api/chat/:bookingId/messages`
- **Auth**: Required (must be booking participant)
- **Query**: `page=1&limit=50`
- Returns paginated message history

### Mark Messages as Read
- **PATCH** `/api/chat/:bookingId/read`
- **Auth**: Required (must be booking participant)
- Marks all messages in booking as read for current user

### Delete Message
- **DELETE** `/api/chat/messages/:messageId`
- **Auth**: Required (admin or message sender)
- Deletes a specific message

## Database Schema

### Message Model
```javascript
{
  bookingId: ObjectId (ref: 'Booking'),
  senderId: ObjectId (ref: 'User'),
  message: String (max 500 chars),
  messageType: String (enum: ['text', 'image', 'file']),
  isRead: Boolean,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Security
- JWT authentication required for all operations
- Users can only access chats for bookings they participate in
- Messages are scoped to specific bookings
- Admin users can delete any message
- Regular users can only delete their own messages

## Usage Example

### Client-side Socket.IO Setup
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', localStorage.getItem('token'));

// Join booking chat
socket.emit('join_room', bookingId);

// Send message
socket.emit('send_message', {
  bookingId,
  message: 'Hello!',
  messageType: 'text'
});

// Listen for messages
socket.on('receive_message', (message) => {
  console.log('New message:', message);
});

// Typing indicators
socket.emit('typing', { bookingId });
socket.emit('stop_typing', { bookingId });
```

### Client-side REST API
```javascript
// Get chat list
const chats = await fetch('/api/chat', {
  headers: { Authorization: `Bearer ${token}` }
});

// Get messages for booking
const messages = await fetch(`/api/chat/${bookingId}/messages`, {
  headers: { Authorization: `Bearer ${token}` }
});

// Mark as read
await fetch(`/api/chat/${bookingId}/read`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${token}` }
});
```