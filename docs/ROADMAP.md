# GridSpace Backend Roadmap

This roadmap outlines the enhancement steps to complete before implementing business logic. Each milestone should be delivered sequentially; do not start the next item until the current one is finished.

## 1. Linting & Formatting Baseline
- Research current ESLint + Prettier guidance for Node 18+ with ES modules.
- Install ESLint, Prettier, and recommended configs/plugins.
- Add `npm run lint` and `npm run lint:fix` scripts.
- Provide a minimal `.eslintrc` and `.prettierrc` (or package.json equivalents).

## 2. Automated Testing Framework
- Evaluate Jest (or alternative) documentation for ES modules support.
- Install testing dependencies and configure Babel or `ts-jest` only if required.
- Create sample unit test(s) and update `npm test` script.
- Document how to run tests locally.

## 3. Production Readiness Hardening
- Review current best practices for CORS policies, request ID propagation, and rate limiting.
- Configure CORS with environment-aware origins.
- Add middleware for request IDs/correlation and adjust logging as needed.
- Tune rate limiter defaults (e.g., separate public/admin windows).

## 4. Observability Foundations
- Investigate lightweight metrics/tracing options (e.g., `prom-client`).
- Expose a `/metrics` endpoint guarded appropriately.
- Extend logging to capture request IDs, response times, and error stacks.

## 5. Developer Tooling & Environments
- Create Dockerfile and docker-compose for Node + Mongo.
- Add helper scripts (npm or Makefile) for building, running, and seeding.
- Document local onboarding steps using Docker.

## 6. Continuous Integration
- Set up GitHub Actions (or equivalent) with lint/test workflows.
- Cache dependencies for faster runs.
- Ensure pipeline fails on lint or test errors.
- Update README with badge/status and CI instructions.

## Notes
- Consult up-to-date documentation before each milestone.
- Always install required packages immediately after deciding to use them.
- Keep commits focused per milestone to simplify review.
