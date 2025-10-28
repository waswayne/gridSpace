# Developer Docs

Frontend-friendly references for consuming GridSpace APIs.

## Auth OTP flows

### Password reset

1. `POST /api/v1/auth/password/reset/request`
   - Body: `{ "email": "user@example.com" }`
   - Success: `{ success: true, message: "OTP issued." }`
   - Errors:
     - `400 BAD_REQUEST` – account not found
     - `500 EMAIL_SEND_FAILED` – SMTP credentials missing/invalid

2. `POST /api/v1/auth/password/reset`
   - Body: `{ "email": "user@example.com", "token": "123456", "newPassword": "..." }`
   - Success returns `{ success: true, data: { user, tokens } }`

### Email verification

1. `POST /api/v1/auth/email/verify/request`
   - Body: `{ "email": "user@example.com" }`
   - Errors:
     - `400 BAD_REQUEST` – account missing or already verified
     - `500 EMAIL_SEND_FAILED` – SMTP credentials missing/invalid

2. `POST /api/v1/auth/email/verify`
   - Body: `{ "email": "user@example.com", "token": "123456" }`
   - Success returns `{ success: true, data: { user } }`

> **Note:** These endpoints rely on Nodemailer. Ensure the backend is configured with the `MAIL_*` environment variables before triggering OTP flows from the client.
