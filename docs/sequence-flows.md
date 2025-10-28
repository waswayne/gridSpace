# Sequence Flows

## Booking Lifecycle
1. Renter searches spaces (`GET /api/spaces` with filters).
2. Renter views space detail (`GET /api/spaces/:id`).
3. Renter creates booking (`POST /api/bookings`).
4. System checks availability + applies markup.
5. Booking transitions:
   - `pending` → auto-cancel via TTL if unpaid.
   - `pending` → `upcoming` after confirmation/payment.
   - `upcoming` → `in_progress` at start time.
   - `in_progress` → `completed` or `cancelled`.
6. Reviews triggered post-`completed` status (`POST /api/reports`/reviews).

## Authentication & Onboarding
1. User hits signup/signin (email/password or Google OAuth).
2. On signup, optional profile pic uploaded to Cloudinary.
3. Email verification OTP sent; user verifies via `/verify-email` (fires messaging readiness hook).
4. User completes onboarding (`POST /api/auth/onboarding`) with role, location, purposes (fires messaging onboarding hook).
5. JWT/refresh tokens issued; profile accessible via `/profile`; hosts unlocked to create spaces, renters to explore bookings once onboardingCompleted=true.

## Messaging Workflow (Phase 4)
1. Booking created → conversation seeded (booking/space context).
2. Socket.io connection authenticated via JWT.
3. Messages emitted (`message:send`) → persisted in MongoDB.
4. REST endpoint syncs history (`GET /api/messages/conversation/:id`).
5. Read receipts and typing indicators broadcast to participants.
6. Admin monitoring via moderation endpoints.

## Wallet & Payment Flow (Phase 4)
1. Renter funds wallet via payment gateway session (`POST /api/wallet/fund`).
2. Payment webhook confirms success → wallet balance updated.
3. Booking payment captured from escrow; host payout scheduled.
4. Admin reviews payout requests (`POST /api/payouts/initiate`).

## Reporting & Moderation
1. User submits report with attachments (`POST /api/reports`).
2. Admin dashboard lists incoming reports (`GET /api/admin/reports`).
3. Admin updates status (`PUT /api/admin/reports/:id/status`).
4. Actions logged for audit trail.
