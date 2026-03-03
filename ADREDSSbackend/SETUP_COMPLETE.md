# FYP Backend Setup Guide

## ✓ Installation Complete

Your Express.js backend with authentication is fully set up and ready to use.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── db-setup.js          # Database initialization (MongoDB)
│   ├── controllers/
│   │   └── authController.js    # Sign-up and Sign-in logic
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── routes/
│   │   └── authRoutes.js        # Auth endpoints
│   └── server.js                # Main Express app
├── uploads/                      # CNIC images storage
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
└── README.md                     # Full documentation
```

## Quick Start

### 1. Configure MongoDB

Edit `.env` file with your MongoDB connection string (or set `MONGO_URI`):

```env
MONGO_URI=mongodb://localhost:27017/fyp_db
JWT_SECRET=change_this_to_something_secure
PORT=5000
```

### 2. Start the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The server will:
- Automatically initialize MongoDB connection
- Ensure required collections and indexes exist (handled by models)
- Start listening on http://localhost:5000

### 3. Test the Endpoints

Use Postman, cURL, or any HTTP client:

**Sign Up** (Create account):
```bash
POST http://localhost:5000/api/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "03001234567",
  "password": "password123",
  "role": "seller",
  "cnic_front": "image_path",
  "cnic_back": "image_path"
}
```

**Sign In** (Login):
```bash
POST http://localhost:5000/api/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## Features Implemented

✅ **User Registration**
- Name, email, phone, password validation
- Bcrypt password hashing (salted)
- Seller and Buyer roles
- CNIC image paths for sellers
- Automatic account verification status

✅ **User Authentication**
- Email and password validation
- JWT token generation (7-day expiry)
- Secure password comparison

- ✅ **Database**
- Automatic MongoDB initialization
- Indexed email field for fast lookups
- Role-based indexing
- Timestamps for audit trail

✅ **Security**
- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Input validation for all fields
- Email format validation
- Minimum password length requirement

✅ **Error Handling**
- Comprehensive error messages
- Appropriate HTTP status codes
- Development vs Production error details
- Database error handling

✅ **Developer Tools**
- Nodemon for automatic restart
- CORS enabled for frontend
- Environment variables support
- Detailed API documentation

## Database Schema

**Users Table**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'seller') DEFAULT 'buyer',
  cnic_front VARCHAR(255),
  cnic_back VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## API Response Format

All responses follow this format:

```json
{
  "success": true/false,
  "message": "Descriptive message",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "phone": "03001234567",
    "role": "buyer/seller",
    "verified": false,
    "created_at": "2024-12-07T10:30:00.000Z"
  }
}
```

## HTTP Status Codes

- `200` - Successful signin
- `201` - Account created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid credentials)
- `409` - Conflict (email already exists)
- `500` - Server error

## What's Next?

1. **Update JWT Secret**: Change `JWT_SECRET` in `.env` for production
2. **Add Image Upload**: Implement Multer for CNIC image uploads
3. **Email Verification**: Add email confirmation workflow
4. **Frontend Integration**: Connect React/Vue frontend to these endpoints
5. **User Profile**: Create endpoints to fetch/update user data
6. **Password Reset**: Implement forgot password functionality

## Dependencies Used

- **express** (5.2.1) - Web framework
- **mongoose** - MongoDB ODM
- **bcrypt** (5.1.1) - Password hashing
- **jsonwebtoken** (9.0.0) - JWT token generation
- **dotenv** (16.3.1) - Environment variables
- **cors** (2.8.5) - Cross-Origin Resource Sharing
- **multer** (1.4.5-lts.1) - File upload handling
- **nodemon** (3.0.2) - Development tool for auto-restart

## Troubleshooting

**Issue**: "Error: connect ECONNREFUSED 127.0.0.1:27017"
- **Solution**: Make sure MongoDB is running or `MONGO_URI` is correct

**Issue**: "Error: Authentication failed"
- **Solution**: Check `MONGO_URI` credentials and network access in `.env`

**Issue**: "Port 5000 already in use"
- **Solution**: Change PORT in `.env` or kill the process using port 5000

**Issue**: "Execution policy" error in PowerShell
- **Solution**: Already fixed! Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force`

## Need Help?

Refer to:
- `README.md` - Full documentation
- `API_TESTS.md` - API test examples
- `.env` - Configuration file
- `src/` - Source code with comments

---

**Ready to go!** 🚀
Start with: `npm run dev`
