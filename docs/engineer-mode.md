# Engineer Mode

## Overview
Operational notes for developers maintaining the Workspace Booking Platform backend.

## Logging & Monitoring
- Winston logger with request IDs and JSON metadata.
- Morgan HTTP access logs.
- Prometheus metrics (enable via `METRICS_ENABLED=true`).

## Health & Diagnostics
- `/health` for service status (database, uptime, memory).
- `/metrics` (when enabled) for Prometheus scrape.
- `/ping` basic sanity endpoint.

## Rate Limiting & Security
- Global base limiter via `express-rate-limit` wrapper.
- Request ID middleware for traceability.
- Helmet for CSP and HTTP hardening.
- Shared input sanitizer using `sanitize-html` applied to all free-form text fields.

## Code Review & Commenting
- Provide concise, high-value comments explaining non-obvious intent or trade-offs.
- Prefer module-level summaries for complex files (models, services, controllers).
- Keep comments up to date when refactoring; remove stale notes immediately.

## Graceful Shutdown
- SIGINT/SIGTERM handlers close HTTP server, drain connections, shut MongoDB pool.
- Backup routines triggered via cron in production (see `config/backup.js`).

## Deployment Notes
- Target Node.js 22 runtime.
- Ensure env secrets provided via CI/CD or platform secrets manager.
- Monitor log levels via `LOG_LEVEL` env.
