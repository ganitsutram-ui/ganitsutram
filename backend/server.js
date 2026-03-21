/*
 * GANITSUTRAM
 * A Living Knowledge Ecosystem for Mathematical Discovery
 *
 * "यथा शिखा मयूराणां नागानां मणयो यथा
 *  तद्वद् वेदाङ्गशास्त्रणां गणितं मूर्ध्नि वर्तते"
 *
 * As the crest of a peacock, as the gem on the hood
 * of a cobra — so stands mathematics at the crown
 * of all knowledge.
 *                                       — Brahmagupta
 *                                         628 CE · Brahmasphutasiddhanta
 *
 * Creator:   Jawahar R. Mallah
 * Email:     jawahar@aitdl.com
 * GitHub:    https://github.com/jawahar-mallah
 * Websites:  https://ganitsutram.com
 *            https://aitdl.com
 *
 * Then:  628 CE · Brahmasphutasiddhanta
 * Now:   8 March MMXXVI · Vikram Samvat 2082
 *
 * Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
 *
 * Developer Note:
 * If you intend to reuse this code, please respect
 * the creator and the work behind it.
 */
/**
 * Project: GanitSūtram
 * Author: Jawahar R Mallah
 * Company: AITDL | aitdl.com
 * 
 * Date:
 * Vikram Samvat: VS 2082
 * Gregorian: 2026-03-07
 * 
 * Purpose: Backend entry point for GanitSūtram.
 *          Handles routing, middleware, and database connectivity.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { corsOptions } = require('./middleware/cors');
const db = require('./database/db');
const ipBlacklist = require('./middleware/ip-blacklist');
const threatDetector = require('./middleware/threat-detector');
const securityRepo = require('./database/security-repository');

// Import routes
const solveRoutes = require('./api/solve');
const analyticsRoutes = require('./api/analytics');
const leaderboardRoutes = require('./api/leaderboard');
const i18nService = require('./services/i18n-service');
const achievementService = require('./services/achievement-service');
const practiceService = require('./services/practice-service');
const practiceRoutes = require('./api/practice');
const discoveryRoutes = require('./api/discoveries');
const conceptRoutes = require('./api/concepts');
const progressRoutes = require('./api/user-progress');
const adminRoutes = require('./api/admin');
const patternRoutes = require('./api/patterns');
const securityRoutes = require('./api/security');
const cmsRoutes = require('./api/cms');
const authRoutes = require('./api/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxies (Cloudflare & Render)
// This ensures `req.ip` is the real user IP, not the load balancer IP.
// Required for express-rate-limit to function correctly in prod.
app.set('trust proxy', 1);

// Middleware
app.use(ipBlacklist); // 1. IP Blacklist (FIRST)
app.use(helmet());     // 2. Security headers
app.use(cors(corsOptions)); // 3. CORS
app.use(express.json({ limit: '10kb' })); // 4. Body parsing with limit

// 5. Threat Detector (runs after body parsing)
app.use(threatDetector);

// 6. Static Files
app.use(express.static(path.join(__dirname, '../websites')));

// Static routing for the root
app.get('/', (req, res) => {
    res.redirect('/portal/gate.html');
});

// Routes
app.use('/api/solve', solveRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/discoveries', discoveryRoutes);
app.use('/api/concepts', conceptRoutes);
app.use('/api/user-progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'up',
        db: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
        time: new Date().toISOString(),
        attribution: "GanitSūtram | AITDL"
    });
});

// App Listen
app.listen(PORT, () => {
    const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite';
    console.log(`[Server] GanitSūtram backend running on port ${PORT}`);
    console.log(`[Server] Database adapter: ${dbType}`);

    // Hourly prune of expired IP blocks
    setInterval(async () => {
        try {
            const pruned = await securityRepo.pruneExpired();
            if (pruned > 0) {
                console.log(`[Security] Pruned ${pruned} expired IPs`);
            }
        } catch (err) {
            console.error('[Security Prune] Job failed:', err.message);
        }
    }, 60 * 60 * 1000);
});

module.exports = app;
