# FYP Backend - Authentication System

Complete authentication system with Sign-in and Sign-up endpoints using Express, MongoDB, Bcrypt, and JWT.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote URI)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Database:**
   - Edit `.env` file with your MongoDB connection string (or set `MONGO_URI`):
     ```
     MONGO_URI=mongodb://localhost:27017/fyp_db
     JWT_SECRET=your_super_secret_key
     PORT=5000
     ```

3. **Start the server:**
   - Development mode (with hot reload):
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

The server will initialize MongoDB connection on startup.

## API Endpoints

### Sign-Up
**POST** `/api/signup`

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "03001234567",
  "password": "password123",
  "role": "buyer",
  "cnic_front": "image_path_or_url",
  "cnic_back": "image_path_or_url"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "03001234567",
    "role": "buyer",
    "verified": false,
    "created_at": "2024-12-07T10:30:00.000Z"
  }
}
```

### Sign-In
**POST** `/api/signin`

Request body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Sign in successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "03001234567",
    "role": "buyer",
    "verified": false,
    "created_at": "2024-12-07T10:30:00.000Z"
  }
}
```

## Database Schema

### Users Table
- `id` - Primary key (auto-increment)
- `name` - User's full name
- `email` - Unique email address
- `phone` - Phone number
- `password` - Hashed password (bcrypt)
- `role` - User role (buyer/seller)
- `cnic_front` - CNIC front image path
- `cnic_back` - CNIC back image path
- `verified` - Verification status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

## Features

✓ User registration with validation
✓ Password hashing with bcrypt
✓ JWT token generation
✓ User authentication with email & password
✓ Role-based user accounts (buyer/seller)
✓ CNIC document storage for sellers
✓ Input validation and error handling
✓ CORS enabled for frontend integration
✓ Automatic database initialization

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Successful signin
- `201` - Account created successfully
- `400` - Bad request (missing/invalid fields)
- `401` - Unauthorized (invalid credentials)
- `409` - Conflict (email already registered)
- `500` - Server error

## Security Notes

1. Change `JWT_SECRET` in `.env` for production
2. Use environment variables for sensitive data
3. Always hash passwords with bcrypt
4. Validate and sanitize all inputs
5. Use HTTPS in production
6. Implement rate limiting for authentication endpoints

## Development

The server uses nodemon for automatic restart during development. Any changes to files in the `src` directory will trigger a restart.

```bash
npm run dev
```

## License

ISC
