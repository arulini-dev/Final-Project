import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: [true, 'Please provide a booking ID']
  },
  senderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a sender ID']
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  messageType: {
    type: String,
    enum: {
      values: ['text', 'image', 'file'],
      message: 'Message type must be text, image, or file'
    },
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ bookingId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ bookingId: 1, isRead: 1 });

// Virtual for sender info
messageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});

// Static method to get messages for a booking
messageSchema.statics.getBookingMessages = function(bookingId, limit = 50) {
  return this.find({ bookingId })
    .populate('senderId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .sort({ createdAt: 1 }); // Re-sort for chronological order
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function(bookingId, userId) {
  return this.updateMany(
    { bookingId, senderId: { $ne: userId }, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Instance method to mark single message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);

export default Message;