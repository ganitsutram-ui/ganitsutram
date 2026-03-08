# Cloudflare Integration Guide
Author: Jawahar R Mallah | AITDL
Date: VS 2082 | 2026-03-08

## Why Cloudflare
Cloudflare sits in front of Railway and Vercel for GanitSūtram, providing:
- **DDoS Protection**: Handles volumetric attacks at the edge.
- **Global CDN**: Static assets cached closer to users.
- **WAF (Web Application Firewall)**: Advanced filtering of malicious traffic.
- **Bot Detection**: Identifies and blocks malicious scrapers/scanners.
- **SSL/TLS**: Automated certificate management.

## Setup Steps

1. **Account Creation**: Create a free account at [cloudflare.com](https://cloudflare.com).
2. **Add Domain**: Add `ganitsutram.com` (or your chosen domain).
3. **Nameservers**: Update your domain registrar with the Cloudflare nameservers provided.
4. **DNS Records**: Add CNAME records for the platform subdomains, ensuring the **Proxy (Orange Cloud)** is enabled:
   - `ganitsutram.com` -> Vercel
   - `api.ganitsutram.com` -> Railway
   - `solve.ganitsutram.com` -> Vercel
   - `learn.ganitsutram.com` -> Vercel
   - `practice.ganitsutram.com` -> Vercel
   - `map.ganitsutram.com` -> Vercel
   - `lab.ganitsutram.com` -> Vercel
   - `discover.ganitsutram.com` -> Vercel
5. **SSL/TLS**: Set mode to **Full (strict)** and enable **Always Use HTTPS**.

## Recommended Configuration

### Security Settings (Free Tier)
- **Security Level**: Medium
- **Bot Fight Mode**: ON
- **Browser Integrity Check**: ON

### Custom WAF Rules (5 Free)
1. **Block Known Bots**: `(cf.client.bot)` -> Block
2. **Rate Limit Auth**: URI path contains `/api/auth/login` -> Rate limit 10 req/min per IP.
3. **Challenge High Threat**: `(cf.threat_score gt 50)` -> Managed Challenge.
4. **Allow Health Checks**: URI path equals `/api/health` -> Allow.

### Caching
- **Cache Level**: Standard.
- **Edge Cache TTL**: 1 day for static assets.
- **Bypass Cache**: Create a Page Rule to bypass cache for `api.ganitsutram.com/*`.

## Server Integration
The GanitSūtram backend is already configured to prioritize the `CF-Connecting-IP` header. This ensures that the `ip-blacklist` and `threat-detector` middleware correctly identify the original client IP even when proxied through Cloudflare.
