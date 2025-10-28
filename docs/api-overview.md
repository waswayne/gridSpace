# API Overview

## Auth (`/api/auth`)
- Registration & login issuing access + refresh tokens
- Token refresh endpoint (rotating refresh tokens)
- Password reset & email verification (OTP-based)
- Onboarding completion (role, location, purposes) gated behind verified email
- Messaging hooks fired on email verification and onboarding completion
- Google OAuth handshake (planned parity)

## Spaces (`/api/spaces`)
- CRUD for workspace listings
- Search & filter with pagination
- Media uploads via Cloudinary
- Soft delete, host-specific quotas

## Bookings (`/api/bookings`)
- Create booking with pricing markup
- Status transitions (pending → upcoming → in_progress → completed/cancelled)
- Conflict detection & TTL cleanup
- Refund & reschedule logic

## Reviews (`/api/reports` & `/api/admin` sections)
- Post-booking reviews; host responses
- Admin moderation tools

## Reports & Admin (`/api/reports`, `/api/admin`)
- Report abuse, attach evidence
- Admin dashboards for users/spaces, analytics

## Messaging (Planned)
- Socket.io conversations tied to spaces/bookings
- REST endpoints for history & unread counts

## Payments & Wallet (Planned)
- Wallet funding via Paystack/Flutterwave
- Escrow flows, host payouts, analytics
