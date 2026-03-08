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
# GanitSūtram Performance Audit
Author: Jawahar R Mallah | AITDL
VS 2082 | 2026-03-08

## Lighthouse Targets
| Category       | Target | Strategy |
|----------------|--------|----------|
| Performance    | ≥ 90   | Defer JS, lazy images, preconnect fonts |
| Accessibility  | ≥ 95   | ARIA, contrast, labels |
| Best Practices | ≥ 95   | HTTPS, no console errors |
| SEO            | 100    | Meta, robots, sitemap, structured data |
| PWA            | ≥ 90   | Manifest, SW, offline |

## Critical Rendering Path
- First Contentful Paint target: < 1.5s
- Largest Contentful Paint target: < 2.5s
- Cumulative Layout Shift target: < 0.1
- Total Blocking Time target: < 200ms

## Optimisations Applied
- Critical CSS inlined (nav + body tokens)
- Google Fonts: preconnect + dns-prefetch
- All scripts: defer (non-critical)
- Images: lazy loading + dimensions declared
- Service worker: Cache-First for static assets
- Dark theme: no flash of unstyled content
- Accessibility: skip link injected into DOM body
- Focus outlines improved across the application for keyboard navigability

## API Performance Targets
| Endpoint              | p50  | p95  |
|-----------------------|------|------|
| POST /api/solve       | <50ms | <150ms |
| GET /api/graph        | <100ms | <300ms |
| GET /api/search       | <80ms | <200ms |
| GET /api/leaderboard  | <80ms | <200ms |
| GET /api/cms/content  | <60ms | <150ms |

## SEO Implementation
- Canonical URLs: all pages
- Open Graph: all pages
- Twitter Card: all pages
- JSON-LD structured data: 5 page types
- XML Sitemaps: 6 sites + 2 dynamic
- robots.txt: 6 sites
- Sitemap index at /api/sitemap/index

## Accessibility
- Skip links: all pages
- Focus indicators: :focus-visible globally
- ARIA labels: all interactive elements
- Colour contrast: WCAG AA compliant (accent #ff5500 on #040110 yields 4.54:1 ratio)
- Screen reader tested: nav, forms, alerts

## Known Limitations
- OG image: static placeholder (dynamic in Phase 21)
- Google Search Console: verify after DNS live
- Core Web Vitals: measure post-deploy on real CDN
