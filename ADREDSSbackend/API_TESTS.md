# ADREDSS API Testing Guide

This document provides a comprehensive list of API endpoints available in the ADREDSS backend.

## Base URL
`http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Sign Up
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/signup`
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `name`: (String) e.g., Ali Ahmed
  - `email`: (String) e.g., ali@example.com
  - `phone`: (String) e.g., 03001234567
  - `password`: (String) min 6 chars
  - `role`: (String) `seller` or `buyer`
- **Files:**
  - `cnicFront`: (Image file)
  - `cnicBack`: (Image file)
- **Notes:** Sends an OTP to the user's email upon success.

### Sign In
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/signin`
- **Content-Type:** `application/json`
```json
{
  "email": "ali@example.com",
  "password": "SecurePass123"
}
```

### Send OTP
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/send-otp`
- **Content-Type:** `application/json`
```json
{
  "email": "ali@example.com",
  "purpose": "verify" 
}
```
*(Purpose can be 'verify' or 'reset')*

### Verify OTP
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/verify-otp`
- **Content-Type:** `application/json`
```json
{
  "email": "ali@example.com",
  "otp": "123456"
}
```

### Forgot Password
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/forgot-password`
- **Content-Type:** `application/json`
```json
{
  "email": "ali@example.com"
}
```

### Reset Password
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/reset-password`
- **Content-Type:** `application/json`
```json
{
  "email": "ali@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass456"
}
```

### Resend Verification
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/resend-verification`
- **Content-Type:** `application/json`
```json
{
  "email": "ali@example.com"
}
```

### Get Authenticated User
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/user`
- **Headers:** 
  - `Authorization`: `Bearer <AUTH_TOKEN>`

---

## 2. Admin Endpoints

### Admin Sign Up
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/admin/signup`
- **Content-Type:** `application/json`
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPassword123"
}
```

### Admin Sign In
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/admin/signin`
- **Content-Type:** `application/json`
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123"
}
```

### List All Users (Admin Only)
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/admin/users`
- **Headers:** 
  - `Authorization`: `Bearer <ADMIN_TOKEN>`

---

## 3. Property Management Endpoints

### Add Property
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/properties`
- **Content-Type:** `application/json`
```json
{
  "title": "Modern House in DHA",
  "description": "Luxurious 500 sq yard house",
  "price": 50000000,
  "address": "DHA Phase 6, Karachi",
  "propertyType": "house",
  "category": "sell",
  "bedrooms": 4,
  "bathrooms": 5,
  "area": "500 sq yard",
  "images": ["url1", "url2"]
}
```

### List All Properties
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/properties`
- **Queries:** 
  - `type`: (String) `house`, `flat`, `other`
  - `category`: (String) `rent`, `sell`
  - `search`: (String) keyword search in title/address
  - `minPrice`: (Number)
  - `maxPrice`: (Number)
  - `page`: (Number) default 1
  - `limit`: (Number) default 10

### Get Property by ID
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/properties/:id`

### Update Property
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/properties/:id`
- **Content-Type:** `application/json`
```json
{
  "title": "Updated Property Title",
  "price": 55000000,
  "status": "sold"
}
```

### Get Property Recommendations (AI)
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/properties/:id/recommendations`
- **Returns:** List of similar properties based on type and price proximity.

### AI Natural Language Search
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/properties/ai-search?query=3 bed house in Karachi under 20M`
- **Functionality:** Parses natural language queries into structured database filters.

### Delete Property
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/properties/:id`

---

## 4. Analytics Endpoints

### Get Market Statistics
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/analytics/stats`
- **Returns:** Total listings, verified brokers count, average prices, and monthly trends.

---

## 5. Specific Property Type Endpoints

### Add Flat
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/flats`
- **Content-Type:** `application/json`
```json
{
  "title": "2 Bed Apartment",
  "price": 15000000,
  "address": "Gulshan-e-Iqbal, Karachi"
}
```

### List All Flats
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/flats`

### Add House
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/houses`
- **Content-Type:** `application/json`
```json
{
  "title": "Small Villa",
  "price": 25000000,
  "address": "Bahria Town, Lahore"
}
```

### List All Houses
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/houses`

---

## Health Check
- **Method:** `GET`
- **URL:** `http://localhost:5000/health`
