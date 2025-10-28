# GridSpace Authentication API Guide

Base URL: `http://localhost:3000/api/v1/auth`

All responses follow `{ success, message, data? }` format. When tokens are issued, they are returned under `data.tokens`.

## Common Headers

- `Content-Type: application/json` (unless noted)
- Authenticated endpoints require `Authorization: Bearer <accessToken>`

---

## 1. Register User

**POST** `/register`  
Content-Type: `multipart/form-data`

| Field         | Type    | Required | Notes                                   |
|---------------|---------|----------|-----------------------------------------|
| `fullName`    | string  | yes      |                                         |
| `email`       | string  | yes      | Valid email format                      |
| `password`    | string  | yes      | Min 6 chars                             |
| `phoneNumber` | string  | no       |                                         |
| `profileImage`| file    | no       | JPEG/PNG up to 5MB (stored via Cloudinary)

**Sample (form-data):**
```
fullName: Jane Doe
email: jane@example.com
password: StrongPass!123
phoneNumber: +2348012345678
profileImage: <attach image>
```

**Success Response 201**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "email": "jane@example.com", ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

---

## 2. Login

**POST** `/login`
```json
{
  "email": "jane@example.com",
  "password": "StrongPass!123"
}
```

**Success 200** → same shape as register response.

`401` if credentials invalid.

---

## 3. Refresh Session

**POST** `/refresh`
```json
{
  "refreshToken": "<refresh-token>"
}
```

Returns new access & refresh tokens. `401` if token invalid/expired.

---

## 4. Request Password Reset OTP

**POST** `/password/reset/request`
```json
{
  "email": "jane@example.com"
}
```

**Success 200**
```json
{
  "success": true,
  "message": "Password reset OTP issued. Check your email for the code.",
  "debugToken": "123456" // only in non-production
}
```

---

## 5. Reset Password

**POST** `/password/reset`
```json
{
  "email": "jane@example.com",
  "token": "123456",
  "newPassword": "NewPass!456"
}
```

Returns updated user + new tokens.

---

## 6. Request Email Verification

**POST** `/email/verify/request`
```json
{
  "email": "jane@example.com"
}
```

Success message mirrors password reset request. `debugToken` only outside production.

---

## 7. Verify Email

**POST** `/email/verify`
```json
{
  "email": "jane@example.com",
  "token": "654321"
}
```

Returns verified user. Messaging hooks fire server-side.

---

## 8. Complete Onboarding

Requires prior email verification.

**POST** `/onboarding`
```json
{
  "role": "host",
  "location": "Lagos, NG",
  "purposes": ["events", "workshop"]
}
```

- Headers: `Authorization: Bearer <accessToken>`
- `role` must be `user` or `host`.
- On success `onboardingCompleted` becomes `true` and messaging hook fires.

**Success 200**
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "user": {
      "id": "...",
      "role": "host",
      "location": "Lagos, NG",
      "purposes": ["events", "workshop"],
      "onboardingCompleted": true,
      ...
    }
  }
}
```

---

## Error Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["\"email\" is required"]
}
```

---

## Testing Checklist

1. Register → capture tokens.
2. Login → verify tokens regenerate.
3. Refresh → ensure new tokens issued.
4. Request/verify email OTP → confirm `emailVerified` true.
5. Request/reset password → old refresh tokens should be invalidated.
6. Onboarding → confirm role/location persist and access level changes.

Use these flows as baselines for frontend integration and automated tests.

---

## 9. Google OAuth Flows

### a. Client-side (ID Token) Sign-In
- **POST** `/google/id-token`
- Body:
```json
{
  "idToken": "<google-id-token>"
}
```
- Returns the same shape as login/registration with user + tokens.

**Steps for frontend:**
1. Use Google Identity Services to obtain an ID token.
2. POST it to `/google/id-token`.
3. Store returned access/refresh tokens.

### b. Server-side Authorization Code Exchange
- **GET** `/google/url?state=optional` → returns `{ data: { url } }` for redirect.
- User completes Google consent → Google redirects back to your frontend with `code` (+ `state`).
- **POST** `/google/code`
```json
{
  "code": "<authorization-code>",
  "state": "<echoed-state>"
}
```
- Response mirrors login payload.

### c. Error Handling
If Google OAuth is not configured (missing `GOOGLE_OAUTH_CLIENT_ID`), endpoints return `400` with message `"Google OAuth is not configured"`.

**Next Step:** Frontend should immediately route new Google sign-ins to the onboarding form (POST `/auth/onboarding`) to collect `role` (`user` or `host`) and `location`. Once submitted, `onboardingCompleted` flips to `true` and the user can continue to spaces/host features.
