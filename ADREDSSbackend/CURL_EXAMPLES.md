# API Testing with cURL Commands

## Prerequisites
- Server running: `npm run dev`
- MongoDB running or `MONGO_URI` configured in `.env`

## Sign-Up Endpoint

### Create a new buyer account
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ali Ahmed",
    "email": "ali@example.com",
    "phone": "03001234567",
    "password": "securepass123",
    "role": "buyer"
  }'
```

### Create a new seller account with CNIC images
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    ````markdown
    # API Testing with cURL Commands

    ## Prerequisites
    - Server running: `npm run dev`
    - MongoDB running or `MONGO_URI` configured in `.env`

    ## Sign-Up Endpoint

    ### Create a new buyer account
    ```bash
    curl -X POST http://localhost:5000/api/signup \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Ali Ahmed",
        "email": "ali@example.com",
        "phone": "03001234567",
        "password": "securepass123",
        "role": "buyer"
      }'
    ```

    ### Create a new seller account with CNIC images
    ```bash
    curl -X POST http://localhost:5000/api/signup \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Fatima Khan",
        "email": "fatima@shop.com",
        "phone": "03005678901",
        "password": "SellerPass@123",
        "role": "seller",
        "cnic_front": "/uploads/cnic_front_12345.jpg",
        "cnic_back": "/uploads/cnic_back_12345.jpg"
      # API Testing with cURL Commands

      ## Prerequisites
      - Server running: `npm run dev`
      - MongoDB running or `MONGO_URI` configured in `.env`

      ## Property Endpoints

      ### Create a property (seller/admin)
      ```bash
      curl -X POST http://localhost:5000/api/properties \
        -H "Content-Type: application/json" \
        -d '{
          "title": "Spacious 2BHK Flat",
          "description": "Near park, newly renovated",
          "price": 45000,
          "address": "Gulberg, Lahore",
          "propertyType": "flat",
          "category": "rent",
          "bedrooms": 2,
          "bathrooms": 2,
          "area": 900,
          "images": ["/uploads/img1.jpg"]
        }'
      ```

      ### List properties (filter by type and/or category)
      List all flats for rent:
      ```bash
      curl -X GET "http://localhost:5000/api/properties?type=flat&category=rent"
      ```

      List all properties for sale:
      ```bash
      curl -X GET "http://localhost:5000/api/properties?category=sell"
      ```

      ### Get single property
      ```bash
      curl -X GET http://localhost:5000/api/properties/<PROPERTY_ID>
      ```

      ## Auth Endpoints (examples)

      ### Sign-Up
      ```bash
      curl -X POST http://localhost:5000/api/signup \
        -H "Content-Type: application/json" \
        -d '{
          "name": "Ali Ahmed",
          "email": "ali@example.com",
          "phone": "03001234567",
          "password": "securepass123",
          "role": "buyer"
        }'
      ```

      ### Sign-In
      ```bash
      curl -X POST http://localhost:5000/api/signin \
        -H "Content-Type: application/json" \
        -d '{
          "email": "ali@example.com",
          "password": "securepass123"
        }'
      ```

      ## Notes
      - When creating a property, `category` is required and must be `rent` or `sell`.
      - Use the returned JWT from sign-in in `Authorization: Bearer <token>` for protected endpoints.
