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
# GanitSūtram Deployment Guide
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com
Vikram Samvat: VS 2082 | Gregorian: 2026-03-07

## Overview
This document outlines the procedure for deploying the GanitSūtram platform to production.
- **Backend API**: Hosted on Railway.
- **Database**: SQLite on Railway persistent volume.
- **Frontend Sites**: Hosted as individual projects on Vercel.

---

## 1. Prerequisites
- GitHub repository with the latest code.
- Railway.app account.
- Vercel.com account.
- Dedicated domains for all sites (see Domain Map).

---

## 2. Backend Deployment (Railway)

1. **Create New Project**: Select "Deploy from GitHub repo".
2. **Root Directory**: Set to `backend/`.
3. **Volume**: Add a volume named `ganit-data` and mount it to `/data`.
4. **Environment Variables**:
   Add the following variables to the Railway project:
   - `PORT`: 3000
   - `NODE_ENV`: production
   - `JWT_SECRET`: [Secure 64+ char string]
   - `JWT_EXPIRES_IN`: 7d
   - `BCRYPT_ROUNDS`: 12
   - `DB_PATH`: /data/ganitsutram.db
   - `ALLOWED_ORIGINS`: https://ganitsutram.com,https://discover.ganitsutram.com,https://learn.ganitsutram.com,https://map.ganitsutram.com,https://lab.ganitsutram.com,https://solve.ganitsutram.com
5. **Domain**: Connect `api.ganitsutram.com` to the Railway service.

---

## 3. Frontend Deployment (Vercel)

You must create **6 separate projects** on Vercel, each pointing to a subfolder in `websites/`.

### Deployment Steps (Repeat for each site):
1. **Import Repo**: Select the GanitSūtram repository.
2. **Project Settings**:
   - **Framework Preset**: Other (Static).
   - **Root Directory**: `websites/<site-folder>/` (e.g., `websites/portal/`).
3. **Build Command**: Leave empty (override if necessary, but sites are currently vanilla HTML/JS).
4. **Output Directory**: `.` (current directory).
5. **Custom Domain**: Assign the domain as per the map below.

### Domain Map:
| Site | Domain | Root Folder |
|---|---|---|
| **Portal** | ganitsutram.com | `websites/portal` |
| **Learning** | learn.ganitsutram.com | `websites/learning` |
| **Discoveries** | discover.ganitsutram.com | `websites/discoveries` |
| **Knowledge Map** | map.ganitsutram.com | `websites/knowledge-map` |
| **Research Lab** | lab.ganitsutram.com | `websites/research-lab` |
| **Solver** | solve.ganitsutram.com | `websites/solver` |

---

## 4. Post-Deployment Verification

Checklist:
- [ ] **Health Check**: `GET https://api.ganitsutram.com/api/health` returns `{ status: "ok" }`.
- [ ] **SSL**: All domains are serving over HTTPS.
- [ ] **CORS**: Navigate to `solve.ganitsutram.com`, perform a calculation. Check browser console for CORS errors.
- [ ] **Persistence**: Restart the Railway service and verify that user registrations and progress are retained (volume sanity check).
- [ ] **CSP**: Verify that `vercel.json` headers are correctly applied (check Network tab headers).

---

## 5. Security & Maintenance

- **Secrets**: Never commit `.env` files. Rotate `JWT_SECRET` if compromised.
- **Logs**: Monitor Railway logs for 403 Forbidden errors (CORS violations).
- **Backups**: Periodically download `/data/ganitsutram.db` from Railway for local backup.

---

## Attribution
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com
VS 2082 | 2026-03-07
All Rights Reserved.
