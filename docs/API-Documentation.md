# Backend API Documentation

This document describes the available API endpoints and how to consume them using React (with **Axios**).

## Base Configuration

Recommended Axios setup:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Update to your Rails server URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Required if using sessions/cookies
});

export default api;
```

---

## 1. Authentication & Users

### User Registration (Sign Up)
**Endpoint:** `POST /users/register`  
**Parameters:**
- `user[name]`: string
- `user[email]`: string (CUHK email)
- `user[password]`: string
- `user[cuhk_id]`: string
- `user[hostel]`: string
- `user[is_admin]`: boolean

**Example:**
```javascript
const register = (userData) => {
  return api.post('/users/register', { user: userData });
};
```

### Verify Email (OTP)
**Endpoint:** `POST /users/verify`  
**Parameters:**
- `email`: string
- `otp`: string (6-digit code)

**Example:**
```javascript
const verifyEmail = (email, otp) => {
  return api.post('/users/verify', { email, otp });
};
```

### Login
**Endpoint:** `POST /sessions`  
**Parameters:**
- `email`: string
- `password`: string

**Note:** Returns the full `user` object on success.

**Example:**
```javascript
const login = async (email, password) => {
  const response = await api.post('/sessions', { email, password });
  // Store response.data.user in your app state
  return response.data;
};
```

### Logout
**Endpoint:** `DELETE /sessions/:id` (ID can be any value, e.g., current user's ID)

**Example:**
```javascript
const logout = (userId) => {
  return api.delete(`/sessions/${userId}`);
};
```

### Resend Verification
**Endpoint:** `POST /users/resend_verification`  
**Parameters:**
- `email`: string

**Example:**
```javascript
const resendOtp = (email) => {
  return api.post('/users/resend_verification', { email });
};
```

---

## 2. User Profile

### Get Profile (Public or Own)
**Endpoint:** `GET /users/:cuhk_id`  
**Note:** Use the 10-digit CUHK Student ID as the ID.

**Example:**
```javascript
const getProfile = (cuhkId) => {
  return api.get(`/users/${cuhkId}`);
};
```

### Update Profile
**Endpoint:** `PATCH /users/:cuhk_id`  
**Note:** Send `user` object or `FormData` for profile picture.

**Example:**
```javascript
const updateProfile = (cuhkId, userData) => {
  return api.patch(`/users/${cuhkId}`, { user: userData });
};
```

### Change Password
**Endpoint:** `POST /users/change_password`  
**Parameters:**
- `email`: string
- `current_password`: string
- `new_password`: string

**Example:**
```javascript
const changePassword = (data) => {
  return api.post('/users/change_password', data);
};
```

### List All Sellers (Search Sellers)
**Endpoint:** `GET /users/sellers`  
Returns a list of all verified sellers in the system.

**Example:**
```javascript
const getSellers = () => {
  return api.get('/users/sellers');
};
```

---

## 3. Products

### List Products (with Search/Pagination)
**Endpoint:** `GET /products`  
**Query Parameters:**
- `keywords`: string (fuzzy search on name)
- `page`: number (default 1)
- `limit`: number (default 15)

**Example:**
```javascript
const getProducts = (params) => {
  return api.get('/products', { params });
};
// Usage: getProducts({ keywords: 'iPhone', page: 1 })
```

### Get Product Details
**Endpoint:** `GET /products/:id`

### Create Product (Multipart/Form-Data)
**Endpoint:** `POST /products`  
**Note:** Use `FormData` for image uploads.

**Example:**
```javascript
const createProduct = (formData) => {
  return api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

### Update Product
**Endpoint:** `PATCH /products/:id`

**Example:**
```javascript
const updateProduct = (id, formData) => {
  return api.patch(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

### Delete Product
**Endpoint:** `DELETE /products/:id`

**Example:**
```javascript
const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};
```

### Get Price History
**Endpoint:** `GET /products/price_history`  
**Query Parameters:**
- `product_id`: number (required)
- `points`: number (optional, max 20)

**Example:**
```javascript
const getPriceHistory = (productId, points = 10) => {
  return api.get('/products/price_history', { params: { product_id: productId, points } });
};
```

---

## 4. Chatting System

### List My Chats
**Endpoint:** `GET /chats`  
Returns a list of conversations (latest first).

### Get Chat with Messages
**Endpoint:** `GET /chats/:id`  
Returns chat summary + list of messages.

### Start a Chat
**Endpoint:** `POST /chats`  
**Parameters:**
- `product_id`: number

**Example:**
```javascript
const startChat = (productId) => {
  return api.post('/chats', { product_id: productId });
};
```

### Messages API
-   `GET /chats/:chat_id/messages`: List messages in a specific chat.
-   `DELETE /chats/:chat_id/messages/:id`: Delete own message.

### Send a Message
**Endpoint:** `POST /chats/:chat_id/messages`  
**Parameters:**
- `message[content]`: string

**Example:**
```javascript
const sendMessage = (chatId, content) => {
  return api.post(`/chats/${chatId}/messages`, {
    message: { content }
  });
};
```

---

## 5. College Community Board

### List Community Items
**Endpoint:** `GET /community_items`  
**Parameters:**
- `college`: string (Optional - Filter by college name)

**Example:**
```javascript
const fetchCommunityItems = (college) => {
  const url = college ? `/community_items?college=${encodeURIComponent(college)}` : '/community_items';
  return api.get(url);
};
```

### Create Community Promotion
**Endpoint:** `POST /community_items`  
**Parameters:**
- `community_item[product_id]`: number
- `community_item[description]`: string
- `community_item[college]`: string (Optional, defaults to user's college)

**Example:**
```javascript
const promoteToCommunity = (data) => {
  return api.post('/community_items', { community_item: data });
};
```

### Integrated Product Creation
When creating a product, you can also promote it to the community in one request.
**Endpoint:** `POST /products`  
**Additional Parameters:**
- `promote_to_community`: "true" (string)
- `community_description`: "Your advertisement text" (string)

---

## Common Response Formats

### Success
Usually returns `200 OK` or `201 Created` with the object data.

### Error (422 Unprocessable Entity)
Returned when validation fails (e.g., email already taken).
```json
{
  "errors": ["Email is invalid", "Password is too short"]
}
```

### Error (401 Unauthorized / 403 Forbidden)
Returned when not logged in or email not verified.
