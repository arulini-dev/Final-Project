# Surprise Event Management System - Backend

A full-stack event management system built with Node.js, Express, and MongoDB.

## Features

- User authentication (Customer/Admin/Vendor)
- Event listing and management
- Booking system with conflict detection
- Reviews and ratings
- Calendar availability
- Real-time chat with Socket.IO
- Vendor marketplace
- AI suggestions
- Payment integration

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **Validation**: Zod
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
src/
├── modules/          # Feature modules (auth, events, etc.)
├── middleware/       # Custom middleware
├── config/          # Database and configuration
├── utils/           # Utility functions
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your configuration:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For production:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /api/health` - Health check
- Authentication, events, bookings, etc. (to be implemented)

## Development

- Uses ES Modules (`"type": "module"`)
- MVC architecture with separate controllers, services, and models
- Centralized error handling
- Async/await throughout
- Zod validation for input data

## License

ISC