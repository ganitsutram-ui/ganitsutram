<!--
  GANITSUTRAM
  A Living Knowledge Ecosystem for Mathematical Discovery

  Creator:   Jawahar R. Mallah
  Email:     jawahar@aitdl.com
  GitHub:    https://github.com/jawahar-mallah
  Websites:  https://ganitsutram.com
             https://aitdl.com

  Then:  628 CE · Brahmasphutasiddhanta
  Now:   8 March MMXXVI · Vikram Samvat 2082

  Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
-->
# GanitSūtram Launch Checklist
Author: Jawahar R Mallah | AITDL
VS 2082 | 2026-03-08

## Pre-Launch (Technical)
**SEO**
- [x] robots.txt live on all 6 domains
- [x] sitemap.xml live on all 6 domains
- [x] /api/sitemap/discoveries returns XML
- [x] All pages have title, description, canonical
- [x] Open Graph tags verified (use opengraph.xyz)
- [x] Twitter Card verified (use cards-dev.twitter.com)
- [x] JSON-LD validates (schema.org validator)

**Performance**
- [ ] Lighthouse ≥ 90 Performance on portal
- [ ] Lighthouse 100 SEO on portal
- [ ] Lighthouse ≥ 95 Accessibility on portal
- [x] All images have loading="lazy" + dimensions
- [x] All non-critical scripts have defer
- [x] Critical CSS inlined
- [x] No render-blocking resources

**PWA**
- [ ] Lighthouse PWA score ≥ 90 (all sites)
- [ ] Install prompt works on mobile Chrome
- [ ] Offline fallback works (airplane mode test)
- [ ] Service workers registered on all 6 sites

**Security**
- [ ] HTTPS on all 6 domains
- [ ] Security headers present (verify via securityheaders.com)
- [ ] CSP does not block any legitimate resources
- [ ] Rate limits active in production mode
- [ ] Admin account password changed from default

**Backend**
- [ ] NODE_ENV=production on Railway
- [ ] All env vars set (JWT_SECRET, SMTP, etc.)
- [ ] /api/health returns 200
- [ ] 128 tests pass (node tests/test-runner.js --all)
- [ ] DB volume mounted at /data on Railway
- [ ] Email delivery verified

## Pre-Launch (Content)
- [ ] All 8 discoveries published in CMS
- [ ] Welcome announcement published
- [ ] Leaderboard announcement published
- [ ] Admin account created + verified
- [ ] Default school admin tested end-to-end

## DNS Go-Live Sequence
1. api.ganitsutram.com → Railway (FIRST — backend must be live before frontends)
2. ganitsutram.com → Vercel portal
3. discover.ganitsutram.com → Vercel discoveries
4. learn.ganitsutram.com → Vercel learning
5. solve.ganitsutram.com → Vercel solver
6. map.ganitsutram.com → Vercel knowledge-map
7. lab.ganitsutram.com → Vercel research-lab

## Post-Launch (Day 1)
- [ ] Google Search Console: verify all 6 domains
- [ ] Submit all 6 sitemaps to GSC
- [ ] Submit sitemap index to GSC
- [ ] Bing Webmaster Tools: submit sitemaps
- [ ] Test registration → email → login flow live
- [ ] Test solve → points → leaderboard flow live
- [ ] Test CMS publish → notification flow live
- [ ] Analytics beacon receiving events
- [ ] SSE connections stable in production

## Post-Launch (Week 1)
- [ ] Monitor Core Web Vitals in GSC
- [ ] Review analytics dashboard for anomalies
- [ ] Check rate limiter false-positive rate
- [ ] Confirm weekly leaderboard reset fires
- [ ] Review first user registrations and feedback
