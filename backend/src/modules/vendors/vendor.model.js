import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Please provide a business name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  approved: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID'],
    unique: true // One vendor account per user
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  contactEmail: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  contactPhone: {
    type: String,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
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
  },
  website: {
    type: String,
    match: [/^https?:\/\/.*/, 'Please provide a valid URL']
  },
  logo: {
    type: String, // URL to logo image
    match: [/^https?:\/\/.*/, 'Please provide a valid URL']
  },
  categories: [{
    type: String,
    enum: {
      values: ['catering', 'decoration', 'entertainment', 'photography', 'venue', 'transportation', 'other'],
      message: 'Category must be one of: catering, decoration, entertainment, photography, venue, transportation, other'
    }
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
vendorSchema.index({ approved: 1, isActive: 1 });
vendorSchema.index({ categories: 1 });
vendorSchema.index({ rating: -1 });

// Virtual for full address
vendorSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  if (!addr) return '';
  return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}, ${addr.country || ''}`.replace(/^, |, $/, '');
});

// Virtual for user info
vendorSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Static method to get approved vendors
vendorSchema.statics.getApprovedVendors = function(filters = {}, page = 1, limit = 10) {
  const query = { approved: true, isActive: true, ...filters };
  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('userId', 'name email avatar')
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get vendors by category
vendorSchema.statics.getVendorsByCategory = function(category, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  return this.find({
    approved: true,
    isActive: true,
    categories: category
  })
    .populate('userId', 'name email avatar')
    .sort({ rating: -1 })
    .skip(skip)
    .limit(limit);
};

// Instance method to update rating
vendorSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating * this.totalReviews;
  this.totalReviews += 1;
  this.rating = (currentTotal + newRating) / this.totalReviews;
  return this.save();
};

// Pre-save middleware to ensure userId uniqueness
vendorSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingVendor = await this.constructor.findOne({ userId: this.userId });
    if (existingVendor) {
      const error = new Error('User already has a vendor account');
      return next(error);
    }
  }
  next();
});

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;