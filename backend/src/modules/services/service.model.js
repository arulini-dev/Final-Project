import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vendor',
    required: [true, 'Please provide a vendor ID']
  },
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: {
      values: ['catering', 'decoration', 'entertainment', 'photography', 'venue', 'transportation', 'other'],
      message: 'Category must be one of: catering, decoration, entertainment, photography, venue, transportation, other'
    }
  },
  images: [{
    type: String,
    match: [/^https?:\/\/.*/, 'Please provide a valid URL']
  }],
  duration: {
    type: Number, // in hours
    min: [0.5, 'Duration must be at least 0.5 hours'],
    max: [24, 'Duration cannot exceed 24 hours']
  },
  capacity: {
    type: Number, // maximum number of people/events
    min: [1, 'Capacity must be at least 1']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'USA'
      }
    }
  },
  availability: {
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeSlots: [{
      startTime: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
      },
      endTime: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
      }
    }],
    blackoutDates: [{
      type: Date
    }],
    advanceBookingDays: {
      type: Number,
      min: [0, 'Advance booking days cannot be negative'],
      default: 0
    }
  },
  features: [{
    type: String,
    maxlength: [50, 'Feature name cannot exceed 50 characters']
  }],
  requirements: [{
    type: String,
    maxlength: [100, 'Requirement cannot exceed 100 characters']
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
serviceSchema.index({ vendorId: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ 'location': '2dsphere' });
serviceSchema.index({ rating: -1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ category: 1, rating: -1, price: 1 });
serviceSchema.index({ tags: 1 });

// Virtual for vendor info
serviceSchema.virtual('vendor', {
  ref: 'Vendor',
  localField: 'vendorId',
  foreignField: '_id',
  justOne: true
});

// Virtual for full address
serviceSchema.virtual('fullAddress').get(function() {
  const addr = this.location?.address;
  if (!addr) return '';
  return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}, ${addr.country || ''}`.replace(/^, |, $/, '');
});

// Static method to get services by category
serviceSchema.statics.getServicesByCategory = function(category, filters = {}, page = 1, limit = 10) {
  const query = { category, isActive: true, ...filters };
  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('vendorId', 'businessName rating logo')
    .sort({ rating: -1, price: 1 })
    .skip(skip)
    .limit(limit);
};

// Static method to search services
serviceSchema.statics.searchServices = function(searchTerm, filters = {}, page = 1, limit = 10) {
  const query = { isActive: true, ...filters };
  const skip = (page - 1) * limit;

  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
      { tags: searchRegex },
      { features: searchRegex }
    ];
  }

  return this.find(query)
    .populate('vendorId', 'businessName rating logo')
    .sort({ rating: -1, price: 1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get services by location
serviceSchema.statics.getServicesByLocation = function(longitude, latitude, maxDistance = 50000, filters = {}, page = 1, limit = 10) {
  const query = { isActive: true, ...filters };
  const skip = (page - 1) * limit;

  return this.find({
    ...query,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  })
    .populate('vendorId', 'businessName rating logo')
    .sort({ rating: -1 })
    .skip(skip)
    .limit(limit);
};

// Instance method to update rating
serviceSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating * this.totalReviews;
  this.totalReviews += 1;
  this.rating = (currentTotal + newRating) / this.totalReviews;
  return this.save();
};

// Instance method to check availability
serviceSchema.methods.isAvailableOn = function(date, startTime, endTime) {
  const dayOfWeek = date.toLocaleLowerCase('en-US', { weekday: 'long' });

  // Check if day is available
  if (!this.availability.daysOfWeek.includes(dayOfWeek)) {
    return false;
  }

  // Check blackout dates
  const isBlackout = this.availability.blackoutDates.some(blackoutDate =>
    blackoutDate.toDateString() === date.toDateString()
  );
  if (isBlackout) {
    return false;
  }

  // Check time slots
  const requestedStart = new Date(`${date.toDateString()} ${startTime}`);
  const requestedEnd = new Date(`${date.toDateString()} ${endTime}`);

  return this.availability.timeSlots.some(slot => {
    const slotStart = new Date(`${date.toDateString()} ${slot.startTime}`);
    const slotEnd = new Date(`${date.toDateString()} ${slot.endTime}`);

    return requestedStart >= slotStart && requestedEnd <= slotEnd;
  });
};

const Service = mongoose.model('Service', serviceSchema);

export default Service;