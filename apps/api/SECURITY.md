## Security practices for shop-wise-api

This document summarizes mandatory security measures and privacy compliance for the API.

- Use helmet, hpp and other HTTP hardening middleware.
- Enforce input validation via class-validator and global ValidationPipe.
- Rate-limit public endpoints and authentication endpoints.
- Use HttpOnly, Secure cookies for session or refresh tokens and set SameSite when appropriate.
- Keep CORS restricted to trusted origins via `CORS_ORIGINS` environment variable.
- Store secrets only in environment variables or a secrets manager; never commit them.
- Rotate keys regularly and use least-privilege for service accounts and DB users.
- Log only necessary data and scrub PII; follow LGPD/GDPR rules for data access and erasure.
- Follow SOC 2 security & monitoring recommendations (access controls, incident response, logging).

Changes made by automation:

- Enforced that `JWT_SECRET` and `COOKIE_SECRET` must be set when `NODE_ENV=production`.
- Replaced Nest/Express rate-limit middleware with Fastify-level rate limiting (`@fastify/rate-limit`) configured in `src/main.ts`.
- Strengthened global `ValidationPipe` to `forbidNonWhitelisted: true` and enabled `transform` to avoid hidden injection vectors.
- Added a minimal set of security response headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) in `src/main.ts`.
- Made bcrypt salt rounds configurable via `BCRYPT_SALT_ROUNDS` (default 12).

Required environment variables (production):

- `JWT_SECRET` - cryptographically strong secret for signing JWTs.
- `COOKIE_SECRET` - secret for signing cookies.
- `CORS_ORIGINS` - comma-separated allowed origins for CORS (must be set for browsers in production).

Recommendations / next steps:

- Add automated dependency vulnerability scanning (Snyk/OSS-Fuzz or GitHub Dependabot).
- Consider using `@fastify/helmet` for more complete header hardening; it was intentionally left out to avoid adding new deps in this change.
- Add content security policy (CSP) for any web-facing UI.
- Review logging to ensure no sensitive fields (passwords, tokens) are logged; redact request bodies in production.
- Rotate and expire refresh tokens server-side and store only hashed refresh tokens (already present in the schema).

CI will run automated checks: dependency audit, static secret scan, linting, and tests.

Contact: security@your-org.example
