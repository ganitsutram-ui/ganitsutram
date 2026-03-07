# GanitSūtram — Architecture Skeleton Reference

**Project:** GanitSūtram
**Author:** Jawahar R Mallah
**Organization:** AITDL | aitdl.com
**Vikram Samvat:** VS 2082 | **Gregorian:** 2026-03-07

> This document is the canonical reference for all contributors and AI agents working on the GanitSūtram. Follow this structure exactly.

---

## 1. Root Folder Structure

```
ganitsutram/
├── core/               ← Mathematical intelligence (algorithms only)
├── backend/            ← Central API server
├── websites/           ← All frontend sites + shared UI
├── docs/               ← Reference, skeletons, architecture docs
└── config/             ← Environment configs, shared settings
```

> **RULE:** Never create folders at the root level other than these five.

---

## 2. Core Layer

```
core/
├── math-engine/
│   ├── digital-root.js
│   ├── squares-ending-5.js
│   ├── multiply-by-11.js
│   ├── nikhilam.js
│   ├── urdhva.js
│   └── pattern-engine.js
├── solver-engine/
└── knowledge-engine/
```

**Rules:**
- Pure functions only. No DOM, no HTTP, no side effects.
- Each module: `validate → compute → return`.
- Use `module.exports` (CommonJS) for Node/backend compatibility.
- Copy `docs/skeleton-math-module.js` as your starting template.

---

## 3. Backend Layer

```
backend/
├── server.js           ← Entry point (Express, CORS, routing)
├── api/
│   └── solve.js        ← POST /api/solve → routes to core/math-engine
├── auth/               ← JWT / session handling
├── services/           ← Business logic wrappers
└── database/           ← DB models and query helpers
```

**API Pattern:**

```
POST /api/solve
Body: { "operation": "digital-root", "input": 98 }

Response:
{
  "operation": "digital-root",
  "input": 98,
  "result": 8,
  "attribution": "GanitSūtram | AITDL"
}
```

**Endpoints to build:**
| Endpoint          | Method | Purpose                        |
|-------------------|--------|-------------------------------|
| `/api/solve`      | POST   | Run a math engine operation    |
| `/api/concepts`   | GET    | Fetch concept definitions      |
| `/api/discoveries`| GET    | Fetch mathematical discoveries |
| `/api/practice`   | GET    | Fetch practice problems        |
| `/api/user-progress` | GET/POST | Track user learning progress |

---

## 4. Websites Layer

```
websites/
├── ui-core/            ← Shared design system (single source of truth)
│   ├── css/
│   │   ├── main.css    ← Global tokens, resets, shared components
│   │   └── portal.css  ← Portal-specific styles (example)
│   ├── js/
│   │   ├── ganit-ui.js ← Shared UI logic, console signature
│   │   └── hero-canvas.js ← Ambient canvas animation
│   ├── fonts/
│   └── assets/
│
├── portal/             ← ganitsutram.com
│   ├── index.html      ← Homepage
│   ├── gate.html       ← Entry gate (scenes → auth → persona)
│   └── src/            ← Vite entry (gate.html only, uses ui-core)
│
├── learning/           ← learn.ganitsutram.com
├── discoveries/        ← discover.ganitsutram.com
├── knowledge-map/      ← map.ganitsutram.com
├── research-lab/       ← lab.ganitsutram.com
└── solver/             ← solve.ganitsutram.com
```

**Rules:**
- All styles → `ui-core/css/`. Never write styles in a website folder.
- All shared JS → `ui-core/js/`. No algorithm logic.
- New site? Extend `ui-core`, do not copy styles.

---

## 5. Domain Map

| Domain                    | Folder                    |
|---------------------------|---------------------------|
| ganitsutram.com           | websites/portal           |
| learn.ganitsutram.com     | websites/learning         |
| discover.ganitsutram.com  | websites/discoveries      |
| map.ganitsutram.com       | websites/knowledge-map    |
| lab.ganitsutram.com       | websites/research-lab     |
| solve.ganitsutram.com     | websites/solver           |
| api.ganitsutram.com       | backend/server.js         |

---

## 6. Skeleton Templates (in `docs/`)

| File | Use for |
|---|---|
| `skeleton-page.html` | Starting template for any new HTML page |
| `skeleton-module.js` | Starting template for any new `ui-core/js/` module |
| `skeleton-math-module.js` | Starting template for any new `core/math-engine/` algorithm |

---

## 7. Mandatory Attribution Rules

### File Header (every `.js`, `.css`, `.html`)
```
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07
```

### HTML Meta Tags (every `.html` file)
```html
<meta name="author" content="Jawahar R Mallah">
<meta name="company" content="AITDL">
<meta name="project" content="GanitSūtram">
```

### DevTools Signature (every `.html` file, before `<!DOCTYPE>`)
```html
<!--
GANITSUTRAM PLATFORM
System Architect: Jawahar R Mallah
Organization: AITDL | aitdl.com
-->
```

### Footer (every public page)
```
© GanitSūtram | AITDL | aitdl.com
Vikram Samvat: VS 2082 | Gregorian: 2026-03-07
All Rights Reserved.
Unauthorized copying, reproduction, redistribution, or reuse of
this software, algorithms, or educational content is prohibited
without written permission from AITDL.
```

---

## 8. Google Fonts (standard import)

```html
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200;400;700;900&family=DM+Serif+Display:ital@0;1&family=Syne:wght@400;600;700;800&family=Noto+Serif+Devanagari:wght@300;400;700&family=Space+Grotesk:wght@300;400;500;700&display=swap" rel="stylesheet">
```

---

## 9. CSS Design Tokens (from `ui-core/css/main.css`)

```css
--bg-deep: #040110;
--fg-main: #ffffff;
--accent-primary: #ff5500;
--accent-secondary: #ffb300;
--accent-soft: rgba(255, 179, 0, 0.4);

--font-logo: 'Unbounded', sans-serif;
--font-main: 'Space Grotesk', sans-serif;
--font-ancient: 'Noto Serif Devanagari', serif;
--font-serif: 'DM Serif Display', serif;
```

---

## 10. Development Order

| # | Layer | What to build |
|---|---|---|
| 1 | websites/portal | Homepage, gate, auth |
| 2 | core/math-engine | All algorithm modules |
| 3 | backend/api | Solver API, concepts API |
| 4 | websites/discoveries | Pattern showcase |
| 5 | websites/knowledge-map | Interactive graph |
| 6 | websites/learning | Persona-driven paths |
| 7 | websites/research-lab | Experimental tools |
