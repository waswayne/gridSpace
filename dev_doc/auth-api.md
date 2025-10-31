# Auth API (v1)

> Base path: `/api/v1/auth`

### Quick navigation
- [Overview](#overview)
- [Conventions & Headers](#conventions--headers)
- [Endpoint catalogue](#endpoint-catalogue)
- [Endpoint details](#endpoint-details)
- [Error reference](#error-reference)
- [Suggested manual test flow](#suggested-manual-test-flow)

---

## Overview
The authentication service powers user sign-up, login, onboarding, credential recovery, email verification, Google OAuth, and profile image uploads. Every JSON payload returned by the backend uses the shared envelope below unless stated otherwise.

```json
{
  "success": true,
  "message": "Human readable summary",
  "data": {}
}
```

When a request fails, `success` becomes `false` and the `error` object contains structured metadata.

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": []
  },
  "requestId": "<uuid>"
}
```

Tokens are always returned inside `data.tokens` unless the endpoint only mutates a profile field.

---

## Conventions & Headers

| Item | Value |
| --- | --- |
| Content type (JSON endpoints) | `application/json` |
| Content type (file uploads) | `multipart/form-data` |
| Authentication | `Authorization: Bearer <accessToken>` for protected routes |
| Date handling | All timestamps are ISO 8601 strings in UTC |

### Email delivery & rate limits

- **Provider selection**: Production uses [Resend](https://resend.com/) via `RESEND_API_KEY`. If the key is absent (e.g. local development), the service falls back to the SMTP credentials supplied in `MAIL_SMTP_*`.
- **Allowed sender**: Resend requires `MAIL_FROM_ADDRESS` to live on a verified domain. Gmail addresses work only when using the SMTP fallback and will be rejected if the Resend key is present.
- **Branded templates**: Password-reset and email-verification emails share a consistent layout with CTA buttons generated from `MAIL_FRONTEND_BASE_URL`.
- **Throttle guard**: OTP requests are throttled per email address. Defaults (`AUTH_OTP_COOLDOWN_SECONDS=60`, `AUTH_OTP_MAX_PER_HOUR=5`) reject rapid retries with `429 OTP_RATE_LIMITED` and a suggested retry timestamp in the error payload.

The backend also accepts the optional header `x-request-id` if the client wants to supply a request correlation ID; otherwise one is generated automatically.

---

## Endpoint catalogue

| Method & Path | Requires auth? | Description |
| --- | --- | --- |
| `POST /register` | No | Create a local account via email + password. |
| `POST /login` | No | Authenticate with email + password and receive tokens. |
| `POST /refresh` | No | Exchange a valid refresh token for a new token pair. |
| `POST /password/reset/request` | No | Issue a one-time password (OTP) for password reset. |
| `POST /password/reset` | No | Confirm password reset using the OTP and email. |
| `POST /email/verify/request` | No | Request an OTP for email verification. |
| `POST /email/verify` | No | Verify email ownership using the OTP. |
| `POST /onboarding` | Yes | Mark role-specific onboarding metadata. |
| `POST /profile-image` | Yes + file | Upload or replace the authenticated user’s avatar. |
| `GET /google/url` | No | Return the Google OAuth authorization URL. |
| `POST /google/id-token` | No | Sign in/up using a client-side Google ID token. |
| `POST /google/code` | No | Exchange a server-side Google authorization code. |

---

## Endpoint details

### Register — `POST /register`

Creates a local GridSpace user. Registration accepts JSON only; profile images must be uploaded after login via `/profile-image`.

```jsonc
{
  "fullName": "Test User",
  "email": "test.user@example.com",
  "password": "Test123!@#",
  "phoneNumber": "+2348012345678"
}
```

Successful response (201):

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "690328b0cb9bd6c3385cf2f1",
      "fullName": "Test User",
      "email": "test.user@example.com",
      "role": "user",
      "emailVerified": false,
      "onboardingCompleted": false,
      "profileImageUrl": null
    },
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<refresh-jwt>"
    }
  }
}
```

### Login — `POST /login`

```json
{
  "email": "test.user@example.com",
  "password": "Test123!@#"
}
```

Returns the same payload structure as registration. Invalid credentials result in a `401` with `code: "UNAUTHORIZED"`.

### Refresh tokens — `POST /refresh`

```json
{
  "refreshToken": "<refresh-jwt>"
}
```

The refresh token is validated and rotated. Clients must persist the new pair since the previous refresh token becomes invalid.

### Request password reset OTP — `POST /password/reset/request`

```json
{
  "email": "test.user@example.com"
}
```

Sends a 6-digit OTP via the configured SMTP provider. When `NODE_ENV !== "production"`, the payload includes a `debugToken` for QA flows.

### Reset password — `POST /password/reset`

```json
{
  "email": "test.user@example.com",
  "token": "123456",
  "newPassword": "NewPass!456"
}
```

On success the OTP is consumed and the standard `user + tokens` payload is returned, allowing the client to treat the action as an immediate sign-in.

### Request email verification OTP — `POST /email/verify/request`

Request shape mirrors the password reset request. OTP delivery channel and `debugToken` logic are the same.

### Verify email — `POST /email/verify`

```json
{
  "email": "test.user@example.com",
  "token": "654321"
}
```

Response:

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "_id": "690328b0cb9bd6c3385cf2f1",
      "emailVerified": true,
      "verifiedAt": "2025-10-30T09:12:00.123Z"
    }
  }
}
```

### Complete onboarding — `POST /onboarding`

Protected endpoint; requires a valid bearer token.

```jsonc
{
  "role": "host",
  "location": "Lagos, NG",
  "purposes": ["events", "workshop"] // array or JSON string accepted
}
```

Marks `onboardingCompleted: true` and persists the submitted metadata. The updated user profile is returned.

### Upload profile image — `POST /profile-image`

- Requires bearer token
- `multipart/form-data` with a single field `profileImage`
- Accepts `image/jpeg`, `image/png`, `image/webp` up to 5 MB

Example using curl:

```bash
curl -X POST \
  -H "Authorization: Bearer <accessToken>" \
  -F "profileImage=@./avatar.png" \
  http://localhost:3000/api/v1/auth/profile-image
```

Successful response:

```json
{
  "success": true,
  "message": "Profile image uploaded",
  "data": {
    "user": {
      "_id": "690328b0cb9bd6c3385cf2f1",
      "profileImageUrl": "https://res.cloudinary.com/.../profile.png"
    },
    "profileImageUrl": "https://res.cloudinary.com/.../profile.png"
  }
}
```

Validation failures surface as `400 BAD_REQUEST` with descriptive messages (e.g. invalid mime type, missing file, file too large). If Cloudinary is not configured, a static placeholder URL is returned instead.

### Google OAuth flows

| Flow | Endpoint | Notes |
| --- | --- | --- |
| Authorization URL | `GET /google/url?state=<optional>` | Returns a pre-configured consent URL clients can redirect to. |
| Client-side ID token | `POST /google/id-token` | Accepts a Google ID token obtained on the frontend. |
| Server-side auth code | `POST /google/code` | Exchanges the code for tokens using the backend’s OAuth credentials. |

Both exchange endpoints return the standard `user + tokens` response. All Google-related requests require the environment variables `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and `GOOGLE_OAUTH_REDIRECT_URI` to be present.

---

## Error reference

| HTTP status | `error.code` | When it appears |
| --- | --- | --- |
| `400` | `BAD_REQUEST` | Validation issues, OTP misuse, invalid file type/size. |
| `401` | `UNAUTHORIZED` | Missing/invalid bearer token or incorrect credentials. |
| `403` | `FORBIDDEN` | User lacks the required role (e.g., onboarding not completed). |
| `404` | `NOT_FOUND` | User lookup failures (rare for this module). |
| `429` | `RATE_LIMITED` | Too many requests to password reset/email verification. |
| `500` | `INTERNAL_ERROR` | Unexpected server error (requestId logged for traceability). |

All error responses include `requestId`; please surface it in support tickets to speed up debugging.

---

## Suggested manual test flow

1. `POST /register`
2. `POST /login`
3. `POST /refresh` (store new tokens)
4. `POST /email/verify/request` → `POST /email/verify`
5. `POST /onboarding`
6. `POST /profile-image` (attach JPEG <5 MB)
7. `POST /password/reset/request` → `POST /password/reset`
8. Exercise Google flows: `GET /google/url`, `POST /google/id-token`, `POST /google/code`

Following this order mirrors the integration tests and ensures the frontend wiring aligns with backend expectations.
