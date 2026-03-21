# 🚀 GanitSūtram: Comprehensive Zero-Cost Deployment Guide
**A Living Knowledge Ecosystem on a Global Infrastructure Stack**

This guide documents the "Golden Quadrilateral" architecture used to host GanitSūtram for zero cost while maintaining enterprise-grade performance and security.

---

## 🏗️ The Stack Architecture
| Component | Provider | Role | Why? |
| :--- | :--- | :--- | :--- |
| **Code & CI/CD** | **GitHub** | Version Control | Industry standard, auto-triggers builds. |
| **Database** | **Supabase** | Managed PostgreSQL | Generous free tier, built-in pooling. |
| **Backend** | **Render** | Node.js (Docker/Native) | Auto-deploy from Git, reliable health checks. |
| **Frontend** | **Cloudflare** | Static Pages | Global Edge delivery, free SSL, zero latency. |

---

## 1. 🐘 Database Setup (Supabase)
1.  **Project Creation**: Create a new project in Supabase.
2.  **Schema Migration**: Run your SQL migrations via the SQL Editor or a local `migrate.js` script.
3.  **Connection Pooling**: 
    > [!IMPORTANT]
    > Always use the **Session Pooler URL** (Port 5432) for long-running backends like Express on Render. This prevents "Too many connections" errors.
4.  **Environment Variable**: Store the URL as `DATABASE_URL` in your `.env`.

---

## 2. ⚙️ Backend Hosting (Render)
1.  **Service Type**: Choose "Web Service".
2.  **Connect Repo**: Link your GitHub repo.
3.  **Environment Variables**: 
    - `DATABASE_URL`: (From Supabase)
    - `JWT_SECRET`: (Generate a strong random string)
    - `NODE_ENV`: `production`
4.  **Zero-Cost Tip**: Render's free tier spins down after inactivity. Use a **Health Check** endpoint (`/api/health`) to keep it responsive or handle the initial "cold start" wait on the frontend.

---

## 3. 🌐 Frontend Hosting (Cloudflare Pages)
Cloudflare is the "Speed Layer" of the stack.

1.  **Direct Git Connection**: Choose "Connect to Git" in the Cloudflare Pages dashboard.
2.  **Path Configuration**:
    - If your frontend files are in a subfolder (e.g., `/websites`), set the **Build output directory** to that folder.
    - Set the **Build command** to blank (standard HTML/JS doesn't need a build step).
3.  **Root Redirect**: If you don't have an `index.html` at the root of your `websites` folder, create a simple one that redirects to your main portal:
    ```html
    <meta http-equiv="refresh" content="0; url=./portal/index.html">
    ```

---

## 4. 🔗 The "Glue" (CORS & Config)
To make different providers talk to each other:

### A. CORS (Backend)
Update your CORS middleware to allow the Cloudflare domain:
```javascript
const allowedOrigins = [
  'https://ganitsutram.com', 
  /\.pages\.dev$/           // Allows all Cloudflare preview links
];
```

### B. Environment-Aware Config (Frontend)
Use a centralized `config.js` to detect where the site is running:
- **Localhost?** Use `localhost:3000`.
- **Cloudflare?** Use your Render URL (`onrender.com`).
- **Path Detection**: Detect if the site is at the root (Custom Domain) or a subdirectory (GitHub Pages) to handle relative links perfectly.

---

## 🏁 Final Result
With this setup, every time you `git push`:
1.  **GitHub** updates.
2.  **Render** redeploys the Backend.
3.  **Cloudflare** redeploys the Frontend.
4.  **Supabase** handles the persistent data.

**Cost: $0.00 / Month**
**Scalability: Ready for Global Traffic**

---
*Authored for the GanitSūtram Community by Jawahar R. Mallah & the Antigravity Team.*
