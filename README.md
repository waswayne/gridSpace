# GridSpace Backend

Production-ready Express.js backend scaffold using ES modules and SOLID principles. Business logic is intentionally stubbed for future implementation.

## Prerequisites

- Node.js >= 18.17.0
- npm >= 9

## Setup

1. Install dependencies:
  ```bash
  npm install
  ```

2. Copy the `.env.example` file to `.env` and fill in the variables:
  ```bash
  cp .env.example .env
  ```

### Email / SMTP setup

The authentication flows now send OTP codes via email using Nodemailer. Configure either a well-known service (e.g., Gmail with an app password) or your own SMTP host by filling in the `MAIL_*` variables in `.env`:

```env
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME=GridSpace
MAIL_SMTP_SERVICE=gmail
MAIL_SMTP_USER=you@gmail.com
MAIL_SMTP_APP_PASSWORD=16-character-app-pass
# or provide MAIL_SMTP_HOST / MAIL_SMTP_PORT / MAIL_SMTP_PASS for a custom SMTP server
```

Without these variables, password reset and email verification emails cannot be delivered and the respective endpoints will respond with `EMAIL_SEND_FAILED`.

Configure environment variables in `.env`, including MongoDB connection details.

## Scripts

- `npm run dev` – start development server with live reload
- `npm start` – start production server

## API Overview

- Base path: `/api`
- Default version: `/v1`

All versioned route handlers currently throw `NotImplementedError` to indicate pending business logic.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Extending

1. Add new routes under `src/routes/v1`.
2. Create matching controller and service classes.
3. Inject repositories or adapters via constructor for testability.
4. Implement MongoDB models under `src/models` and provide repository logic.
5. Add request validation schemas in `src/validations`.

## Logging

Structured logging via `winston`. `morgan` streams HTTP access logs to the logger. Logs write to stdout by default.

## Error Handling

Centralized error middleware returns JSON with `success`, `error.code`, and `error.message`. Throw `AppError` or `NotImplementedError` for domain-specific responses.

## API Documentation

- Swagger UI: `http://localhost:3000/api/docs`
- Swagger JSON: `http://localhost:3000/api/docs/json`
