# GanitSūtram Production Readiness Checklist
Author: Jawahar R Mallah | AITDL
VS 2082 | 2026-03-07

## Backend
- [ ] NODE_ENV=production set on Railway
- [ ] JWT_SECRET is 64+ chars random string
- [ ] BCRYPT_ROUNDS=12 confirmed
- [ ] DB_PATH points to Railway volume /data
- [ ] SMTP credentials configured + verified
- [ ] ALLOWED_ORIGINS lists all 6 domains
- [ ] Rate limiters verified in production mode
- [ ] /api/health returns 200
- [ ] All 12 test suites pass (0 failures)

## Database
- [ ] Railway volume mounted at /data
- [ ] ganitsutram.db created on first run
- [ ] All migrations run successfully
- [ ] WAL mode enabled
- [ ] Foreign keys enforced
- [ ] Backup policy configured (weekly minimum)

## Frontend (per site × 6)
- [ ] manifest.json valid (Lighthouse check)
- [ ] Service worker registered
- [ ] PWA installable (Lighthouse score > 90)
- [ ] All data-i18n attributes applied
- [ ] Language switcher works (EN/HI/SA)
- [ ] Mobile responsive at 320px, 480px, 768px
- [ ] All API calls use production URL
- [ ] No localhost references in production build

## Security
- [ ] X-Powered-By header removed
- [ ] Helmet headers present
- [ ] CORS blocks non-whitelisted origins
- [ ] Rate limits trigger at correct thresholds
- [ ] XSS vectors rejected cleanly
- [ ] SQL injection attempts sanitised
- [ ] Reset tokens expire after 30 minutes
- [ ] Refresh token reuse triggers family revocation

## DNS & Domains
- [ ] ganitsutram.com → Vercel portal
- [ ] discover.ganitsutram.com → Vercel discoveries
- [ ] learn.ganitsutram.com → Vercel learning
- [ ] map.ganitsutram.com → Vercel knowledge-map
- [ ] lab.ganitsutram.com → Vercel research-lab
- [ ] solve.ganitsutram.com → Vercel solver
- [ ] api.ganitsutram.com → Railway backend
- [ ] All domains have SSL certificates

## Performance
- [ ] Lighthouse score > 90 (Performance) on portal
- [ ] Lighthouse score > 90 (Accessibility)
- [ ] API response time < 200ms (p95) for solve
- [ ] Static assets cached by service worker

## Content
- [ ] All attribution headers present in every file
- [ ] Footer copyright on every public page
- [ ] Sanskrit invocations display correctly
- [ ] Devanagari font loads on all platforms

## Post-Launch
- [ ] Analytics beacon receiving page_view events
- [ ] Admin can see analytics dashboard
- [ ] Email delivery verified (welcome + reset)
- [ ] Register → verify → login full flow tested
- [ ] School admin flow tested end-to-end
