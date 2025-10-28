# Deployment Runbook

## Overview
Checklist for deploying the Workspace Booking Platform backend to production.

## Pre-Deployment
- Ensure CI pipeline (lint + test) is green.
- Verify `.env.production` values (Mongo URI, Cloudinary, Mailer, OAuth, JWT secrets, Paystack/Flutterwave).
- Confirm migrations/indexes prepared for MongoDB collections.
- Review release notes with frontend team.

## Deployment Steps
1. Build Docker image or prepare Node environment (Node.js 22).
2. Provide environment variables via secrets manager.
3. Run `npm install --production` (or leverage Docker layer cache).
4. Execute `npm run lint` and `npm test` in staging.
5. Start application (`node src/index.js` or process manager like PM2).
6. Verify health endpoints (`/health`, `/metrics` if enabled).

## Post-Deployment
- Monitor logs for errors during first hour.
- Validate critical flows (auth, booking creation, search) via smoke tests.
- Confirm cron backups scheduled (production only).
- Update status page/communication if needed.

## Rollback Plan
- Maintain previous release artifacts for quick redeploy.
- For data issues, restore from latest backup snapshot.
- Notify stakeholders immediately with incident report.
