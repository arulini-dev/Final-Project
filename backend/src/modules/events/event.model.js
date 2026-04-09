import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  basePrice: {
    type: Number,
    required: [true, 'Please add a base price'],
    min: [0, 'Base price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: {
      values: ['wedding', 'birthday', 'corporate', 'anniversary', 'other'],
      message: 'Category must be one of: wedding, birthday, corporate, anniversary, other'
    }
  },
  date: {
    type: Date,
    required: [true, 'Please add an event date']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Please add capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  availableSpots: {
    type: Number,
    required: [true, 'Please add available spots'],
    min: [0, 'Available spots cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.capacity;
      },
      message: 'Available spots cannot exceed capacity'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      message: 'Status must be one of: upcoming, ongoing, completed, cancelled'
    },
    default: 'upcoming'
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be a valid URL'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
eventSchema.index({ category: 1, isActive: 1 });
eventSchema.index({ createdAt: -1 });

// Virtual for reviews (if we have a review model later)
eventSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'event',
  justOne: false
});

// Static method to get events by category
eventSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Instance method to update average rating
eventSchema.methods.updateAverageRating = async function() {
  // This will be implemented when we have reviews
  // For now, just return the current average
  return this.averageRating;
};

const Event = mongoose.model('Event', eventSchema);

export default Event;