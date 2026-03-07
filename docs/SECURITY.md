# GanitSūtram Security Overview
Author: Jawahar R Mallah | AITDL
VS 2082 | 2026-03-07

## Rate Limiting
Rate limiting is enforced via `express-rate-limit` to prevent brute force and DoS attacks.

| Limiter | Target Endpoint(s) | Window | Max Requests | Message / Action |
| --- | --- | --- | --- | --- |
| `globalLimiter` | All Routes | 15 mins | 500 | Prevents general scraping/DoS. |
| `authLimiter` | `/api/auth/*` | 15 mins | 20 | Prevents brute forcing login/register. |
| `forgotPasswordLimiter` | `/api/auth/forgot-password` | 60 mins | 5 | Limits spamming reset emails. |
| `solveLimiter` | `/api/solve` | 1 min | 60 | Prevents compute exhaustion. |
| `patternLimiter` | `/api/patterns/*` | 1 min | 30 | Prevents heavy query loops. |
| `adminLimiter` | `/api/admin/*` | 15 mins | 100 | General admin API limit. |

## Input Sanitisation
- **`xss`**: Strips malicious HTML and scripts from all string inputs in the request body automatically across all routes via the `sanitiseBody` middleware.
- **`validator`**: Used strictly on endpoints to validate emails and integers.
- **Payload Limits**: `express.json({ limit: '10kb' })` enforces a strict 10kb ceiling on JSON body size.
- **Extreme Inputs**: The solver rejects numeric inputs exceeding `10^15` to prevent event-loop blocking or engine crashes.

## Authentication Security
- **Passwords**: Hashed with `bcrypt` (12 rounds).
- **JWT**: Signed with `HS256`, 15-minute expiry. Stored solely in `localStorage` securely.
- **Refresh Tokens**: Cryptographically secure 40-byte hex strings. Issued with 30-day expiry. Stored as `SHA-256` hashes in `refresh_sessions` with `family_id` groupings.
- **Token Rotation**: Every refresh cycle issues a new rotating token. Detecting reuse of rotated tokens triggers an immediate catastrophic revocation of the entire family chain to block hijacked lines.
- **Reset Tokens**: Cryptographically secure URL tokens generated, but only stored as `SHA-256` hashes in the database. 30-minute expiry.
- **Enum Protection**: The `/forgot-password` endpoint immediately returns HTTP 200 to mitigate email enumeration mapping attacks.

## HTTP Security Headers
Applied globally via `helmet`.

| Header | Purpose |
| --- | --- |
| `Content-Security-Policy` | Restricts scripts, styles, fonts, and images strictly to `'self'` and `data:`. |
| `Strict-Transport-Security (HSTS)` | Enforces HTTPS strictly for 1 year, spanning subdomains. |
| `X-Content-Type-Options` | Enforces `nosniff`, blocking MIME-sniffing. |
| `X-Frame-Options` | Prevents rendering within `iframes` (clickjacking). |
| `X-XSS-Protection` | Legacy cross-site scripting filter enabled for older clients. |
| `X-Powered-By` | Explicitly stripped by custom middleware to hide Express.js internals. |

## CORS Policy
- **Development**: Permissive for `localhost:8080`.
- **Production**: Strictly confined to `*.ganitsutram.com` subdomains defined via environment variable injection.

## Known Limitations (Post-Phase 10)
- SQLite Database is single-file; it is not suited for concurrent writes scaling past ~10,000 active concurrent users.
- No global firewall or dynamic IP blacklisting applied at the Node layer.

## Security Checklist
- [x] Configure robust refresh token sliding windows
- [ ] Set strong `JWT_SECRET` (min 64 chars) in production.
- [ ] Set `NODE_ENV=production` on hosting provider.
- [ ] Rotate SMTP credentials regularly.
- [ ] Enable Volume/EBS block backups for the SQLite database.
- [ ] Audit `ALLOWED_ORIGINS` strictly before triggering production deployment pipelines.
