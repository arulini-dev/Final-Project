# Vendor and Service Modules Documentation

## Overview
The Vendor and Service modules provide a comprehensive marketplace system for the Surprise Event Management System. Vendors can register, get approved, and offer various services that customers can browse and book.

## Vendor Module

### Features
- Vendor registration and approval system
- Business profile management
- Category-based organization
- Rating and review system
- Admin approval workflow

### Database Schema
```javascript
{
  businessName: String (unique, required),
  approved: Boolean (default: false),
  userId: ObjectId (ref: 'User', unique),
  description: String,
  contactEmail: String,
  contactPhone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String (default: 'USA')
  },
  website: String,
  logo: String,
  categories: [String] (enum: catering, decoration, entertainment, photography, venue, transportation, other),
  rating: Number (0-5),
  totalReviews: Number,
  isActive: Boolean (default: true)
}
```

### API Endpoints

#### Public Endpoints
- `GET /api/vendors/approved` - Get approved vendors
- `GET /api/vendors/:id` - Get vendor by ID

#### Protected Endpoints (Vendor/Admin)
- `POST /api/vendors` - Create vendor profile
- `GET /api/vendors/profile/my` - Get my vendor profile
- `PATCH /api/vendors/:id` - Update vendor profile
- `DELETE /api/vendors/:id` - Delete vendor profile

#### Admin Only
- `GET /api/vendors/admin/all` - Get all vendors (admin)
- `PATCH /api/vendors/:id/approve` - Approve/reject vendor
- `GET /api/vendors/admin/stats` - Get vendor statistics

## Service Module

### Features
- Service creation and management by vendors
- Location-based search with geospatial queries
- Availability management with time slots
- Category and tag-based filtering
- Price range filtering
- Rating and review system

### Database Schema
```javascript
{
  vendorId: ObjectId (ref: 'Vendor', required),
  name: String (required),
  description: String,
  price: Number (required, min: 0),
  category: String (enum: required),
  images: [String],
  duration: Number (hours),
  capacity: Number,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude],
    address: { street, city, state, zipCode, country }
  },
  availability: {
    daysOfWeek: [String],
    timeSlots: [{ startTime, endTime }],
    blackoutDates: [Date],
    advanceBookingDays: Number
  },
  features: [String],
  requirements: [String],
  rating: Number (0-5),
  totalReviews: Number,
  isActive: Boolean (default: true),
  tags: [String]
}
```

### API Endpoints

#### Public Endpoints
- `GET /api/services/featured` - Get featured services
- `GET /api/services/search` - Search services with filters
- `GET /api/services/category/:category` - Get services by category
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/vendor/:vendorId` - Get services by vendor

#### Protected Endpoints (Vendor/Admin)
- `POST /api/services` - Create service
- `GET /api/services/profile/my` - Get my services
- `PATCH /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `POST /api/services/:id/availability` - Check service availability

#### Admin Only
- `GET /api/services/admin/stats` - Get service statistics

## Query Parameters

### Service Search Filters
- `category` - Service category
- `minPrice` / `maxPrice` - Price range
- `search` - Text search in name, description, tags
- `longitude` / `latitude` / `maxDistance` - Location-based search
- `tags` - Comma-separated tags
- `vendorId` - Filter by vendor
- `sortBy` - Sort field (rating, price, createdAt, name)
- `sortOrder` - Sort order (asc, desc)
- `page` / `limit` - Pagination

## Usage Examples

### Create a Vendor
```javascript
POST /api/vendors
{
  "businessName": "Dream Events Co",
  "description": "Professional event planning services",
  "contactEmail": "contact@dreamevents.com",
  "categories": ["catering", "decoration"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

### Create a Service
```javascript
POST /api/services
{
  "name": "Wedding Photography Package",
  "description": "Complete wedding photography coverage",
  "price": 1500,
  "category": "photography",
  "duration": 8,
  "capacity": 1,
  "location": {
    "coordinates": [-74.006, 40.7128],
    "address": {
      "city": "New York",
      "state": "NY"
    }
  },
  "availability": {
    "daysOfWeek": ["friday", "saturday", "sunday"],
    "timeSlots": [
      { "startTime": "08:00", "endTime": "18:00" }
    ]
  },
  "features": ["Digital album", "Prints", "Online gallery"],
  "tags": ["wedding", "portrait", "outdoor"]
}
```

### Search Services
```javascript
GET /api/services/search?category=photography&minPrice=500&maxPrice=2000&longitude=-74.006&latitude=40.7128&maxDistance=50000
```

## Security & Permissions

### Vendor Permissions
- Users can create only one vendor account
- Vendors must be approved by admin to be visible
- Vendors can only manage their own services
- Admin can manage all vendors and services

### Service Permissions
- Only approved vendors can create services
- Services are automatically associated with vendor
- Public can view approved services
- Vendors can only edit their own services

## Geospatial Features

### Location Search
- Services can be searched by proximity using MongoDB's 2dsphere index
- Supports radius-based queries in meters
- Returns services within specified distance from coordinates

### Availability Checking
- Check if service is available on specific date/time
- Considers days of week, time slots, and blackout dates
- Advance booking restrictions

## Categories

### Vendor Categories
- catering
- decoration
- entertainment
- photography
- venue
- transportation
- other

### Service Categories (same as vendor categories)
Services inherit categories from their vendors but can be more specific.

## Rating System

### Vendor Ratings
- Calculated from service reviews
- Displayed on vendor profiles
- Used for sorting and filtering

### Service Ratings
- Based on customer reviews
- Separate from vendor rating
- Influences search rankings