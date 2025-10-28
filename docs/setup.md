# Setup Guide

## Purpose
Outline prerequisites and local environment steps for the Workspace Booking Platform backend.

## Prerequisites
- Node.js 22+
- MongoDB instance
- Cloudinary account (images)
- Mail provider credentials
- OAuth client (Google)

## Installation
1. Clone repositories (`gridspace_backend`, client).
2. Install dependencies via `npm install`.
3. Copy `.env.example` to `.env` and fill in values (see below).

## Environment Variables
- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRES_IN`
- `CLOUDINARY_*`
- `PASSWORD_RESET_TTL_MINUTES`
- `EMAIL_VERIFICATION_TTL_MINUTES`
- `MAIL_*`
- `GOOGLE_OAUTH_*`
- `METRICS_ENABLED`

## Running Services
- `npm run dev` – start backend with nodemon.
- `npm run lint` – lint checks.
- `npm test` / `npm run test:watch` – execute Vitest suite.

## Additional Notes
- See `engineer-mode.md` for operational insights.
