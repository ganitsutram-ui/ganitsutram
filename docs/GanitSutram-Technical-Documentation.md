# GanitSūtram — Complete Technical Documentation
## Platform Architecture, API Reference & Developer Guide
**Version:** v1.0  
**Author:** Jawahar R Mallah  
**Org:** AITDL | aitdl.com  
**Date:** Vikram Samvat VS 2082 | Gregorian 2026-03-08  
**Tagline:** "Ancient Mathematics. Modern Platform."

---

## SECTION 1 — PLATFORM OVERVIEW

### 1.1 Vision & Mission
GanitSūtram is a living knowledge ecosystem built on Vedic mathematics, pattern intelligence, and the ancient science of numbers.

**Mission:** Make Vedic and classical mathematics accessible, interactive, and intellectually engaging for students, teachers, researchers, and curious minds worldwide.

### 1.2 The Six Websites
| Site          | Domain                       | Purpose                          | Status |
|---------------|------------------------------|----------------------------------|--------|
| Portal        | ganitsutram.com              | Homepage, gate, CMS, search      | Live   |
| Discoveries   | discover.ganitsutram.com     | Mathematical discovery browser   | Live   |
| Learning      | learn.ganitsutram.com        | Courses, practice, leaderboard   | Live   |
| Knowledge Map | map.ganitsutram.com          | D3 interactive knowledge graph   | Live   |
| Research Lab  | lab.ganitsutram.com          | Experimental Vedic tools         | Live   |
| Solver        | solve.ganitsutram.com        | Live computation engine          | Live   |

### 1.3 Technology Stack
| Layer       | Technology                             |
|-------------|----------------------------------------|
| Frontend    | Vanilla JS, HTML5, CSS3, D3.js (v7)    |
| Backend     | Node.js 20+, Express.js 4               |
| Database    | SQLite (dev) / PostgreSQL 18 (prod)     |
| Auth        | JWT 15min + Refresh Tokens 30d          |
| Search      | SQLite FTS5 / PostgreSQL tsvector       |
| Realtime    | Server-Sent Events (SSE)                |
| Email       | Nodemailer (SMTP)                       |
| Deploy      | Vercel (frontend) + Railway (backend)   |
| i18n        | Vanilla JS — EN, HI, SA                 |
| PWA         | Web App Manifest + Service Workers      |
| Security    | Helmet, express-rate-limit, xss,        |
|             | IP blacklist, threat detector           |
| CDN/WAF     | Cloudflare (proxy + DDoS + WAF)         |

### 1.4 Complete Build History
| # | Phase                            | Key Deliverables          | Tests |
|---|----------------------------------|---------------------------|-------|
| 1 | 6 Websites + UI Core             | All sites, design system  | —     |
| 2 | Core Math Engine                 | 5 algorithm modules       | —     |
| 3 | Backend API + Database           | Express, SQLite, repos    | —     |
| 4 | Pattern Engine                   | Kaprekar, Fibonacci       | —     |
| 5 | School Admin Dashboard           | requireRole middleware    | —     |
| 6 | API Documentation Page           | 30+ endpoints docs        | —     |
| 7 | User Profile + Badges            | Profile dashboard         | —     |
| 8 | Email + Password Reset           | Nodemailer, SHA-256       | —     |
| 9 | Security Hardening               | Helmet, rate limits, XSS  | —     |
| 10| Refresh Token Rotation           | Family reuse detection    | —     |
| 11| Analytics Dashboard              | Event telemetry, beacon   | —     |
| 12| PWA + Mobile                     | Manifests, SW, responsive | —     |
| 13| i18n EN/HI/SA                    | Locale engine, switcher   | —     |
| 14| Localised Errors + Numbers       | Devanagari formatting     | —     |
| 15| End-to-End Test Suite            | Custom runner             | 96    |
| 16| Leaderboard + Gamification       | 20 badges, points         | 104   |
| 17| CMS                              | Multilingual editor       | 116   |
| 18| Notification System + SSE        | Real-time alerts          | 130   |
| 19| Search + Knowledge Graph         | FTS5, BFS pathfinder      | 153   |
| 20| SEO + Launch Prep                | OG, JSON-LD, sitemaps     | 153   |
| 21| PostgreSQL + Hybrid Config       | Dual-adapter, config.js   | 153   |
| 22| Cloudflare + IP Blacklist        | Threat detection          | 153   |

---

## SECTION 2 — ARCHITECTURE

### 2.1 Root Folder Structure
```text
ganitsutram/
├── core/               ← Math algorithms (pure functions)
├── backend/            ← Express API server
├── websites/           ← 6 static sites + ui-core
├── docs/               ← All documentation
└── config/             ← Environment configs
```

### 2.3 System Architecture Diagram
```text
┌─────────────────────────────────────────┐
│           User Browser                  │
└──────────────┬──────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────┐
│         Cloudflare Edge                 │
│   DDoS · WAF · CDN · SSL                │
└──────────────┬──────────────────────────┘
               │
     ┌─────────┴──────────┐
     │                    │
┌────▼─────┐        ┌─────▼──────┐
│  Vercel  │        │  Railway   │
│ (6 sites)│        │  Backend   │
└────┬─────┘        └─────┬──────┘
     │ fetch()             │
     └──────────┬──────────┘
                │
┌───────────────▼─────────────────────────┐
│         Express Middleware Stack        │
│  ipBlacklist → helmet → cors →          │
│  sanitise → threatDetector → routes     │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│           core/math-engine/             │
│     Pure functions. No side effects.    │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│     SQLite (dev) / PostgreSQL (prod)    │
│          23 tables · WAL mode           │
└─────────────────────────────────────────┘
```

### 2.4 Layer Rules
1. **Core Immobility**: `core/` must never import from `backend/` or `websites/`.
2. **Pure Math**: Algorithms in `core/math-engine/` must be pure functions.
3. **Frontend Isolation**: Frontend sites only communicate with the Backend API.
4. **Style Sovereignty**: All CSS must reside in `ui-core/`. No ad-hoc styles in individual sites.
5. **Database Abstraction**: Use the repository pattern (`backend/database/`) for all DB interactions.
6. **Security First**: All requests must pass through the security middleware stack.
7. **Stateless API**: Authentication via JWT; no server-side session state (except refresh tokens).
8. **I18n Parity**: All new features must support EN, HI, and SA locales.

### 2.6 Environment Config
The `config/config.js` file handles URL switching between Development and Production environments for all subdomains.

---

## SECTION 3 — CORE MATH ENGINE

### 3.1 Overview & Rules
Location: `core/math-engine/`. Every module follows the `validate → compute → return` pattern using CommonJS `module.exports`.

### 3.2 Module: Digital Root
**Vedic basis:** Beejank, casting out nines  
**Sanskrit:** बीजांक  
**Functions:** `digitalRoot(n)`, `digitalRootWithSteps(n)`  
**Example:** 98 → 9+8=17 → 1+7=8 → result: 8

### 3.3 Module: Squares Ending in 5
**Sutra:** Ekadhikena Pūrvena  
**Sanskrit:** एकाधिकेन पूर्वेण  
**Functions:** `squaresEndingFive(n)`, `...WithSteps(n)`  
**Algorithm:** For n=X5, result = X×(X+1) concat 25  
**Example:** 75² → 7×8=56 → 5625

### 3.4 Module: Multiply by 11
**Vedic technique:** Digit insertion method  
**Functions:** `multiplyBy11(n)`, `...WithSteps(n)`  
**Example:** 57×11 → 5_(5+7)_7 → 627

### 3.5 Module: Nikhilam
**Sutra:** Nikhilam Navatashcaramam Dashatah  
**Sanskrit:** निखिलं नवतश्चरमं दशतः  
**Functions:** `nikhilam(a, b)`, `...WithSteps(a, b)`  
**Example:** 98×97, base 100 → 9506

### 3.6 Module: Ūrdhva-Tiryak
**Sutra:** Ūrdhva-Tiryagbhyām  
**Sanskrit:** ऊर्ध्वतिर्यग्भ्याम्  
**Functions:** `urdhva(a, b)`, `...WithSteps(a, b)`  
**Example:** 23×45 → 1035

### 3.7 Module: Pattern Engine
| Function                    | Returns                                  |
|-----------------------------|------------------------------------------|
| detectDigitalRootCycle      | 1-9 repeating cycle analysis             |
| detectSquarePattern         | [1, 4, 9, 7, 7, 9, 4, 1, 9] cycle        |
| detectSumOfDigitsPattern    | Linear digit sum analysis                |
| detectPalindromePattern     | Range density of palindromes             |
| detectMultiples11Pattern    | Bridging digit sum analysis              |
| detectConsecutiveSquareDiff | 2n+1 odd number pattern                  |
| analyseSequence             | AP/GP and property detection             |
| kaprekarRoutine             | Steps to 6174 or 495                     |
| fibonacciDigitalRoots       | 24-step DR cycle length                  |

---

## SECTION 4 — BACKEND API

The backend is an Express.js server providing a RESTful interface for all mathematical and platform operations.

### 4.1 Master Endpoint List
- **POST /api/solve**: Central hub for math engine execution.
- **GET /api/concepts**: Knowledge retrieval.
- **GET /api/discoveries**: Pattern library access.
- **POST /api/auth/register-login**: JWT-based identity management.
- **GET /api/leaderboard**: Global gaming ranks.
- **GET /api/notifications**: Real-time SSE channel.

---

## SECTION 5 — DATABASE

### 5.1 Dual-Adapter Pattern
Supports transparent switching between **SQLite** (local development) and **PostgreSQL** (production) using a unified `db.js` interface.

---

## SECTION 6 — AUTHENTICATION & SECURITY

### 6.1 Multi-Layer Defense
- **IP Blacklist**: Immediate rejection of malicious IPs.
- **Threat Detector**: RT analysis for SQLi, XSS, and Path Traversal.
- **JWT Rotation**: Passive line-hijacking detection via refresh tokens.
- **Rate Limiting**: Intelligent sliding windows per endpoint.

---

## SECTION 14 — ATTRIBUTION & LEGAL
© GanitSūtram | AITDL | aitdl.com  
Vikram Samvat: VS 2082 | Gregorian: 2026-03-08  
All Rights Reserved. Unauthorized reuse is prohibited.
