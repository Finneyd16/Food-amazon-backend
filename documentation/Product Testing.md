# Postman Testing Guide - Product Routes

## Base URL
```
http://localhost:3001/api/products
```

---

## 1. GET ALL PRODUCTS

**Endpoint:** `GET /get-all-products`

**Auth Required:** ❌ No

**Request:**
```
GET http://localhost:3001/api/products/get-all-products
```

**Expected Response:** `200 OK`
```json
[
  {
    "_id": "691f71d76c6106fe0ae87e10",
    "name": "Berry Bliss Bites",
    "price": 60,
    "varieties": "Berry&Nuts",
    "description": "Delicious berry and nut energy bites packed with antioxidants",
    "productImg": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&q=80",
    "category": {
      "_id": "691dbe9be45f84be42b6b136",
      "name": "Healthy Snacks"
    },
    "productInStock": true,
    "productRating": 0,
    "createdAt": "2024-11-18T10:30:00.000Z",
    "updatedAt": "2024-11-18T10:30:00.000Z",
    "__v": 0
  }
]
```

---

## 2. CREATE PRODUCT

**Endpoint:** `POST /create-product`

**Auth Required:** ✅ Yes (Admin only)

**Headers:**
```
x-auth-token: YOUR_ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Chocolate Dream Cookies",
  "price": 55,
  "varieties": "Dark Chocolate",
  "description": "Rich dark chocolate cookies with a crispy exterior",
  "productImg": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
  "categoryId": "691dbe9be45f84be42b6b136",
  "productInStock": true,
  "productRating": 4.5
}
```

**Expected Response:** `200 OK`
```json
{
  "_id": "691f74ed6c6106fe0ae87e19",
  "name": "Chocolate Dream Cookies",
  "price": 55,
  "varieties": "Dark Chocolate",
  "description": "Rich dark chocolate cookies with a crispy exterior",
  "productImg": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
  "category": {
    "_id": "691dbe9be45f84be42b6b136",
    "name": "Cookies & Biscuits"
  },
  "productInStock": true,
  "productRating": 4.5,
  "createdAt": "2024-11-25T12:00:00.000Z",
  "updatedAt": "2024-11-25T12:00:00.000Z",
  "__v": 0
}
```

**Possible Errors:**
- `400` - Validation error or invalid category
- `401` - No token provided
- `403` - Not an admin

---

## 3. GET SINGLE PRODUCT

**Endpoint:** `GET /get-single-product/:id`

**Auth Required:** ❌ No

**Request:**
```
GET http://localhost:3001/api/products/get-single-product/691f71d76c6106fe0ae87e10
```

**Expected Response:** `200 OK`
```json
{
  "_id": "691f71d76c6106fe0ae87e10",
  "name": "Berry Bliss Bites",
  "price": 60,
  "varieties": "Berry&Nuts",
  "description": "Delicious berry and nut energy bites packed with antioxidants",
  "productImg": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&q=80",
  "category": {
    "_id": "691dbe9be45f84be42b6b136",
    "name": "Healthy Snacks"
  },
  "productInStock": true,
  "productRating": 0,
  "__v": 0
}
```

**Possible Errors:**
- `404` - Product not found

---

## 4. UPDATE PRODUCT

**Endpoint:** `PUT /update-product/:id`

**Auth Required:** ✅ Yes (Admin only)

**Headers:**
```
x-auth-token: YOUR_ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```
PUT http://localhost:3001/api/products/update-product/691f71d76c6106fe0ae87e10
```

**Request Body:**
```json
{
  "name": "Berry Bliss Bites Premium",
  "price": 70,
  "varieties": "Berry&Nuts",
  "description": "Premium berry and nut energy bites with organic ingredients",
  "productImg": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&q=80",
  "categoryId": "691dbe9be45f84be42b6b136",
  "productInStock": true,
  "productRating": 4.8
}
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "message": "product updated successfully"
}
```

**Possible Errors:**
- `400` - Validation error or invalid category
- `401` - No token provided
- `403` - Not an admin
- `404` - Product not found

---

## 5. DELETE PRODUCT

**Endpoint:** `DELETE /delete-product/:id`

**Auth Required:** ✅ Yes (Admin only)

**Headers:**
```
x-auth-token: YOUR_ADMIN_JWT_TOKEN
```

**Request:**
```
DELETE http://localhost:3001/api/products/delete-product/691f71d76c6106fe0ae87e10
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "message": "product deleted successfully"
}
```

**Possible Errors:**
- `401` - No token provided
- `403` - Not an admin
- `404` - Product not found

---

## 6. GET PRODUCTS BY CATEGORY

**Endpoint:** `GET /get-products-by-category/:categoryId`

**Auth Required:** ❌ No

**Request:**
```
GET http://localhost:3001/api/products/get-products-by-category/691dbe9be45f84be42b6b136
```

**Expected Response:** `200 OK`
```json
[
  {
    "_id": "691f71d76c6106fe0ae87e10",
    "name": "Berry Bliss Bites",
    "price": 60,
    "productImg": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&q=80",
    "category": {
      "_id": "691dbe9be45f84be42b6b136",
      "name": "Healthy Snacks"
    },
    "productInStock": true
  }
]
```

**Possible Errors:**
- `404` - No products found for category

---

## Getting Admin Token

To test admin routes, you need to:

1. **Register/Login as Admin:**
```
POST http://localhost:3001/api/auth/login
```

**Body:**
```json
{
  "email": "admin@foodamazon.com",
  "password": "yourAdminPassword"
}
```

2. **Copy the JWT token from response**

3. **Add to Postman Headers:**
```
Key: x-auth-token
Value: YOUR_JWT_TOKEN_HERE
```

---

## Quick Test Checklist

- [ ] GET all products (no auth)
- [ ] GET single product by ID (no auth)
- [ ] GET products by category ID (no auth)
- [ ] POST create product (with admin token)
- [ ] PUT update product (with admin token)
- [ ] DELETE product (with admin token)

---

## Testing Tips

1. **Save your admin token as a Postman environment variable:**
   - Variable name: `adminToken`
   - Use: `{{adminToken}}` in headers

2. **Create a Postman Collection** with all these requests for easy reuse

3. **Test validation errors** by sending incomplete data:
   ```json
   {
     "name": "AB",  // Too short - should fail
     "price": -10   // Negative - should fail
   }
   ```

4. **Use valid category IDs** from your database (check MongoDB Compass)