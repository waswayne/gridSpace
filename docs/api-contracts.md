# API Contracts

## Auth (`/api/auth`)
| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| POST | `/register` | multipart (`profileImage?` + `fullName`, `email`, `password`, `phoneNumber?`) | `201 { success, data: { user, tokens } }` | Accepts optional profile image (Cloudinary) |
| POST | `/login` | `{ email, password }` | `200 { success, data: { user, tokens } }` | Issues access + refresh tokens |
| POST | `/refresh` | `{ refreshToken }` | `200 { success, data: { user, tokens } }` | Returns new token pair |
| POST | `/password/reset/request` | `{ email }` | `200 { success, message, debugToken? }` | Sends OTP (debug token only outside prod) |
| POST | `/password/reset` | `{ email, token, newPassword }` | `200 { success, data: { user, tokens } }` | Consumes OTP and rotates tokens |
| POST | `/email/verify/request` | `{ email }` | `200 { success, message, debugToken? }` | Issues verification OTP |
| POST | `/email/verify` | `{ email, token }` | `200 { success, data: { user } }` | Marks emailVerified and fires messaging hook |
| POST | `/onboarding` | `Authorization` header + `{ role, location, purposes? }` | `200 { success, data: { user } }` | Requires verified email; sets onboardingCompleted |

## Spaces (`/api/spaces`)
| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| POST | `/` | Host auth, multipart | `201 { success, data }` | Max 10 active spaces per host |
| GET | `/` | Query filters (`location`, `capacity`, etc.) | `200 { success, data: { results, pagination } }` | Supports pagination via `page`, `limit` |
| GET | `/:id` | - | `200 { success, data }` | Includes availability |
| PUT | `/:id` | Host auth | `200 { success, data }` | Soft delete via `isActive:false` |
| DELETE | `/:id` | Host auth | `200 { success }` | Soft delete |

## Bookings (`/api/bookings`)
| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| POST | `/` | `{ spaceId, startDate, endDate, guests }` | `201 { success, data }` | Applies markup, checks conflicts |
| GET | `/` | Query `status`, `role` | `200 { success, data: { results, pagination } }` | Role-based filtering |
| PUT | `/:id/status` | `{ status }` | `200 { success, data }` | Valid transitions only |
| POST | `/:id/refund` | `{ reason }` | `200 { success }` | Triggers refund workflow |

## Reviews (`/api/reports`, `/api/admin`)
- `POST /api/reports` – submit report with `{ type, spaceId?, bookingId?, message, attachments? }`
- `GET /api/admin/reports` – admin list with filters (`status`, `type`).
- `PUT /api/admin/reports/:id/status` – update moderation status.

## Messaging (Planned)
- `POST /api/messages/send` – send message linked to booking/space.
- `GET /api/messages/conversation/:id` – fetch history.
- `GET /api/messages/unread` – unread count.
- Socket.io events: `message:send`, `message:received`, `typing`.

## Wallet/Payments (Planned)
- `POST /api/wallet/fund` – create funding session (Paystack/Flutterwave).
- `POST /api/wallet/webhook` – handle payment confirmation.
- `POST /api/payouts/initiate` – host payout request.

## Admin Utilities
- `GET /api/admin/users` – list users with filters.
- `PUT /api/admin/users/:id/status` – suspend/reactivate.
- `GET /api/admin/analytics` – aggregated KPIs (bookings, revenue, conversions).
