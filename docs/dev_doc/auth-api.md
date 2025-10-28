**GridSpace Authentication API Guide**

Base URL: `http://localhost:3000/api/auth`

Tokens are returned in the top-level response as `token`. Most endpoints reply using the `{ success, message, ... }` shape; additional fields vary per controller.

## Common Headers

- `Content-Type: application/json` (unless otherwise noted)
- Authenticated routes require `Authorization: Bearer <token>`

---

## 1. Sign Up (Local Accounts)

**POST** `/signup`

Content-Type: `multipart/form-data` to support optional profile pictures.

| Field         | Type    | Required | Notes                                                      |
|---------------|---------|----------|------------------------------------------------------------|
| `fullname`    | string  | yes      | Trimmed before persistence                                 |
| `email`       | string  | yes      | Stored lowercase                                           |
| `password`    | string  | yes      | Minimum 6 characters                                       |
| `phoneNumber` | string  | yes      | Must be unique for local accounts                          |
| `profilePic`  | file    | no       | JPEG/PNG ≤ 5 MB, uploaded to Cloudinary if provided        |

**Sample form-data:**
```
fullname: Jane Doe
email: jane@example.com
password: StrongPass!123
phoneNumber: +2348012345678
profilePic: <attach image>
```

**Success 201**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "email": "jane@example.com",
    "role": "user",
    "onboardingCompleted": false,
    ...
  }
}
```

---

## 2. Sign In

**POST** `/signin`
```json
{
  "email": "jane@example.com",
  "password": "StrongPass!123"
}
```

**Success 200**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "user": { ... }
}
```

`401` when credentials are invalid.

---

## 3. Refresh Token

**POST** `/refresh-token`

- Requires a valid bearer token (the middleware re-issues a fresh JWT).
- No request body.

**Success 200**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "<new-jwt>",
  "user": { ... }
}
```

If the supplied token is missing or invalid, the middleware responds with `401`/`403`.

---

## 4. Request Password Reset OTP

**POST** `/request-password-reset`
```json
{
  "email": "jane@example.com"
}
```

**Success 200**
```json
{
  "success": true,
  "message": "Password reset email sent to your email address",
  "resetToken": "123456"
}
```

`resetToken` echoes the OTP for non-production environments; clients should still rely on email delivery.

---

## 5. Verify Password Reset OTP (Optional Pre-check)

**POST** `/verify-password-reset-otp`
```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```

Returns `200` with `{ success: true, message: "OTP verified" }` or `400` if invalid/expired.

---

## 6. Reset Password

**POST** `/reset-password`
```json
{
  "token": "123456",
  "newPassword": "NewPass!456"
}
```

On success: `{ success: true, message: "Password reset successfully" }`. No tokens are returned; users should sign in again.

---

## 7. Request Email Verification OTP

**POST** `/request-email-verification`
```json
{
  "email": "jane@example.com"
}
```

**Success 200**
```json
{
  "success": true,
  "message": "Verification OTP sent to your email address",
  "remainingAttempts": 3
}
```

Requests made while a valid OTP already exists return the same message without sending a new email and include the remaining retry count. Rate limiting applies after three failed attempts.

---

## 8. Verify Email

**POST** `/verify-email`
```json
{
  "email": "jane@example.com",
  "otp": "654321"
}
```

**Success 200**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

The endpoint increments attempt counters and expires/cleans up OTPs automatically.

---

## 9. Resend Email Verification OTP

**POST** `/resend-email-verification`
```json
{
  "email": "jane@example.com"
}
```

Response mirrors the request endpoint with a fresh OTP when successful.

---

## 10. Complete Onboarding

**POST** `/onboarding`

- Requires bearer authentication.
- Accepts optional multipart upload for profile pictures.

```json
{
  "role": "host",
  "location": "Lagos, NG",
  "purposes": ["events", "workshop"]
}
```

- `role` must be one of `user`, `host`, or `admin`.
- `purposes` can be an array or a JSON string (controller parses both).
- Email verification is recommended but not enforced server-side.

**Success 200**
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "user": {
    "_id": "...",
    "role": "host",
    "onboardingCompleted": true,
    "purposes": ["events", "workshop"],
    "location": "Lagos, NG",
    ...
  }
}
```

---

## 11. Profile Management

- **GET** `/profile` — returns the authenticated user.
- **PUT** `/profile` — multipart form; supports `fullname`, `phoneNumber`, and optional `profilePic` upload.

Both require bearer authentication and respond with `{ success, message, user }`.

---

## 12. Change Password

**PUT** `/change-password`
```json
{
  "currentPassword": "StrongPass!123",
  "newPassword": "StrongerPass!456"
}
```

Responds with `{ success: true, message: "Password changed successfully" }` when the current password matches.

---

## 13. Logout

**POST** `/logout`

Stateless JWT logout; simply returns `{ success: true, message: "Logged out successfully" }`. Clients should delete stored tokens.

---

## 14. Delete Account

**DELETE** `/account`
```json
{
  "password": "StrongPass!123"
}
```

Deletes the authenticated user after password confirmation.

---

## 15. Google OAuth Flows

Environment variables used: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.

### a. Client-side ID Token Flow

- **POST** `/google`
```json
{
  "idToken": "<google-id-token>"
}
```
- Response mirrors local sign-in (`token` + `user`).

### b. Server-side Authorization Code Flow

1. **GET** `/google/url?state=optional` → `{ success, message, authUrl }`
2. User consents with Google → your frontend receives `code` (and optional `state`).
3. **GET** `/google/callback?code=...&state=...` — backend exchanges the code, issues a JWT, and redirects to `FRONTEND_URL` with query params `token` and `success`.

### c. Error Handling

- Invalid or missing Google credentials typically surface as `500` responses with `message: "Google authentication failed"`.
- When configuration is absent, the controllers throw before reaching Google APIs; check environment variables during deployment.

After successful Google sign-in, new users should be guided through `/onboarding` to capture `role` and `location` so `onboardingCompleted` becomes `true`.

---

## Error Patterns

While many controllers return a simple `{ success: false, message: "..." }`, validation errors may include additional context such as `errors` arrays. Clients should always inspect the `message` field and treat non-200 codes as failures.

---

## Suggested Test Flow

1. Sign up (local) → capture returned JWT and ensure user is created.
2. Sign in → confirm JWT and payload.
3. Refresh token → verify a new JWT is issued while the old one is still valid.
4. Request/verify email OTP → ensure `emailVerified` flips to `true`.
5. Request/reset password → confirm password changes and old token becomes unusable after logout.
6. Complete onboarding → verify `role`, `location`, and `onboardingCompleted` persist.
7. Exercise Google flows → validate new accounts are created or existing ones linked.
