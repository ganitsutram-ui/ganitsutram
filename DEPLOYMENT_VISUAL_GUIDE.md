# 🚀 GanitSūtram: The "Zero-Cost" Community Deployment Manual
**A Step-by-Step Visual Guide for Modern Web Infrastructure**

This manual showcases how we migrated the GanitSūtram platform to a professional, scalable, and zero-cost stack using the "Golden Quadrilateral" of cloud providers.

---

## 🏗️ The Architecture Overview
We use a **Decoupled Architecture** to ensure each component runs on its best-in-class free tier:
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Backend API**: [Render](https://render.com) (Node.js/Express)
- **Frontend UI**: [Cloudflare Pages](https://pages.cloudflare.com) (Static CDN)
- **Orchestration**: [GitHub](https://github.com) (Source of Truth)

---

## Step 1: Database Setup (Supabase)
1.  **Create Project**: Start a free project on Supabase.
2.  **Connection Pooling**:
    > [!IMPORTANT]
    > **Crucial Tip**: Use the **Session Pooler** (Port 5432) for production. Express apps on Render can spawn multiple instances; pooling prevents your database from exceeding its connection limit.
3.  **Environment Variables**: Copy your connection string for the next step.

---

## Step 2: Backend Deployment (Render)
1.  **Create Web Service**: Link your GitHub repository.
2.  **Environment Variables**: Add your `DATABASE_URL` and `JWT_SECRET`.
3.  **Health Check**: Set your health check path to `/api/health`. Render uses this to ensure your backend is "alive" before routing traffic.

---

## Step 3: Frontend Deployment (Cloudflare Pages)
This is where most people get confused. Cloudflare has "Workers" and "Pages". We want **Pages**.

### A. The Setup Screen
When connecting your GitHub repo, you will see a build settings screen. 

*(See Screenshot: media__1774102534476)*

> [!TIP]
> **Correct Settings**:
> - **Build command**: (Keep it empty)
> - **Build output directory**: `websites` (This tells Cloudflare to host the contents of the `websites` folder as the root).

### B. Avoiding the "Worker" Trap
If you see a screen that asks for an "API token" or says "Create a Worker", **you are in the wrong place**. Look for the link that says "Looking to deploy Pages? Get started".

*(See Screenshot: media__1774103002535)*

---

## Step 4: Custom Domain & DNS (Cloudflare)
Cloudflare provides the best DNS management in the world.

### A. Nameserver Update
Point your domain (e.g., `ganitsutram.com`) to Cloudflare's nameservers. Once active, Cloudflare will scan your old records.

*(See Screenshot: media__1774104767939)*

### B. Linking Domain to Pages
Go to your Pages project -> **Custom Domains** and add your domain. Cloudflare will automatically update your DNS to point `ganitsutram.com` to your new frontend.

---

## Step 5: The "Glue" Logic
The secret to making this stack work is in the code.

1.  **CORS**: Your Backend (Render) must explicitly allow requests from your Frontend domain.
2.  **Pathing**: Use a `config.js` to detect if you are on `localhost` or `production`.
    ```javascript
    const API_BASE = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api' 
        : 'https://ganitsutram.onrender.com/api';
    ```
3.  **Root Redirect**: If your files are in `/portal/index.html`, add a small redirect at the root so `yoursite.com` works perfectly.

---

## 🏁 The Final Result
A professional, lightning-fast platform running globally for **Exactly $0/month**.

*Documentation created by Jawahar R. Mallah for the GanitSūtram Community.*
