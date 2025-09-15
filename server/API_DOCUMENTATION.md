# GridSpace Authentication API Documentation

## Base URL

```
http://localhost:5000/api/auth
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. User Registration

**POST** `/signup`

Register a new user account.

**Request Body:**

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phonenumber": "+1234567890"
}
```

**Form Data:**

- `profilePic` (optional): Image file for profile picture

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "role": "user",
    "profilePic": "cloudinary-url",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. User Login

**POST** `/signin`

Authenticate user and return JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "role": "user",
    "profilePic": "cloudinary-url",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Get User Profile

**GET** `/profile`

Get current user's profile information.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "user": {
    "_id": "user-id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "role": "user",
    "profilePic": "cloudinary-url",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update User Profile

**PUT** `/profile`

Update user's profile information.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "fullname": "John Smith",
  "phonenumber": "+1234567891"
}
```

**Form Data:**

- `profilePic` (optional): New profile picture image file

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "user-id",
    "fullname": "John Smith",
    "email": "john@example.com",
    "phonenumber": "+1234567891",
    "role": "user",
    "profilePic": "new-cloudinary-url",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Change Password

**PUT** `/change-password`

Change user's password.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 6. Request Password Reset

**POST** `/request-password-reset`

Request a password reset token.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset token generated",
  "resetToken": "reset-token-here"
}
```

### 7. Reset Password

**POST** `/reset-password`

Reset password using reset token.

**Request Body:**

```json
{
  "token": "reset-token-here",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 8. Request Email Verification

**POST** `/request-email-verification`

Request an email verification token.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verification token generated",
  "verificationToken": "verification-token-here"
}
```

### 9. Verify Email

**POST** `/verify-email`

Verify email using verification token.

**Request Body:**

```json
{
  "token": "verification-token-here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 10. Logout

**POST** `/logout`

Logout user (client-side token removal).

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 11. Refresh Token

**POST** `/refresh-token`

Refresh JWT token.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "new-jwt-token-here",
  "user": {
    "_id": "user-id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "role": "user",
    "profilePic": "cloudinary-url",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 12. Delete Account

**DELETE** `/account`

Delete user account permanently.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "password": "currentpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Additional error details"] // Optional
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Consider implementing rate limiting for:

- Login attempts
- Password reset requests
- Email verification requests

## Security Notes

1. **JWT Tokens**: Tokens expire after 7 days by default
2. **Password Reset**: Tokens expire after 1 hour
3. **Email Verification**: Tokens expire after 24 hours
4. **Password Hashing**: Uses bcrypt with salt rounds of 12
5. **File Uploads**: Profile pictures are uploaded to Cloudinary with automatic optimization

## Environment Variables Required

```env
MONGO_URI=mongodb://localhost:27017/gridspace
JWT_SECRET=your-jwt-secret
JWT_EXPIRES=7d
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
LOG_LEVEL=info
```
