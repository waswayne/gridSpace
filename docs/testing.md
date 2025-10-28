# Testing Guide

## Overview
How to verify backend functionality during incremental migrations.

## Tooling
- Vitest (`npm test`, `npm run test:watch`)
- ESLint + Prettier (`npm run lint`, `npm run format:check`)

## Test Strategy
1. **Unit Tests** – services, utilities, controllers (mocking DB as needed).
2. **Integration Tests** – API endpoints via supertest + in-memory Mongo.
3. **Regression Parity** – Compare responses against legacy expectations for key flows (auth, spaces, bookings).

## Running Tests
- `npm test` – single run with coverage summary.
- `npm run test:watch` – watch mode for development.
- `npm run test:coverage` – coverage report.

## Lint & Format
- `npm run lint` – enforce ESLint rules.
- `npm run lint:fix` – auto-fix lint errors where possible.
- `npm run format:check` / `npm run format` – Prettier formatting.

## Future Work
- Add contract tests once endpoints are ported.
- Integrate CI workflows (GitHub Actions) to block merges on failures.
